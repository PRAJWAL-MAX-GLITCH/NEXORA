import prisma from '../../config/db';
import type { StockInInput, StockOutInput, MovementQuery } from './inventory.validation';

export const stockIn = async (data: StockInInput, userId: string) => {
  const { productId, quantity, reason } = data;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { currentStock: { increment: quantity } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        type: 'IN',
        reason,
        createdBy: userId,
      },
    });

    return { product: updatedProduct, movement };
  });
};

export const stockOut = async (data: StockOutInput, userId: string) => {
  const { productId, quantity, reason } = data;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    if (product.currentStock < quantity) {
      throw Object.assign(
        new Error(
          `Insufficient stock. Available: ${product.currentStock}, Requested: ${quantity}`
        ),
        { statusCode: 400 }
      );
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { currentStock: { decrement: quantity } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        type: 'OUT',
        reason,
        createdBy: userId,
      },
    });

    return { product: updatedProduct, movement };
  });
};

export const getMovements = async (query: MovementQuery) => {
  const { page, limit, productId, type } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (productId) where.productId = productId;
  if (type) where.type = type;

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLowStockProducts = async () => {
  // Use raw query to compare currentStock <= minimumStock column-to-column
  const products = await prisma.$queryRaw<any[]>`
    SELECT id, name, sku, category, "currentStock", "minimumStock", "warehouseLocation", "unitPrice"
    FROM "Product"
    WHERE "currentStock" <= "minimumStock"
    ORDER BY "currentStock" ASC
  `;
  return products;
};

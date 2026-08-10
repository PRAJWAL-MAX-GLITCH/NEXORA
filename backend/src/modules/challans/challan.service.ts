import prisma from '../../config/db';
import type { CreateChallanInput, UpdateChallanInput, ChallanQuery } from './challan.validation';

// ─── Auto-generate challan number like CH-2026-00001 ─────────────────────────
const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;

  // Count existing challans this year
  const count = await prisma.challan.count({
    where: { challanNumber: { startsWith: prefix } },
  });

  const seq = String(count + 1).padStart(5, '0');
  return `${prefix}${seq}`;
};

// ─── CREATE (saved as DRAFT) ──────────────────────────────────────────────────
export const createChallan = async (data: CreateChallanInput, userId: string) => {
  const { customerId, items } = data;

  // Validate customer exists
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  }

  // Validate all products exist
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    const foundIds = products.map((p) => p.id);
    const missing = productIds.filter((id) => !foundIds.includes(id));
    throw Object.assign(new Error(`Products not found: ${missing.join(', ')}`), { statusCode: 404 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const challanNumber = await generateChallanNumber();

  return prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      status: 'DRAFT',
      createdBy: userId,
      items: {
        create: items.map((item) => {
          const product = productMap.get(item.productId)!;
          return {
            productId: item.productId,
            productNameSnapshot: product.name,
            skuSnapshot: product.sku,
            unitPriceSnapshot: product.unitPrice,
            quantity: item.quantity,
          };
        }),
      },
    },
    include: {
      customer: { select: { id: true, name: true, mobile: true } },
      items: true,
    },
  });
};

// ─── LIST ─────────────────────────────────────────────────────────────────────
export const getChallans = async (query: ChallanQuery) => {
  const { page, limit, status, customerId, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (search) {
    where.OR = [
      { challanNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, mobile: true } },
        items: true,
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return {
    challans,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────
export const getChallanById = async (id: string) => {
  return prisma.challan.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, mobile: true, businessName: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, currentStock: true } },
        },
      },
    },
  });
};

// ─── UPDATE (DRAFT only) ──────────────────────────────────────────────────────
export const updateChallan = async (id: string, data: UpdateChallanInput, userId: string) => {
  const challan = await prisma.challan.findUnique({ where: { id } });
  if (!challan) throw Object.assign(new Error('Challan not found'), { statusCode: 404 });
  if (challan.status !== 'DRAFT') {
    throw Object.assign(new Error('Only DRAFT challans can be edited'), { statusCode: 400 });
  }

  const { customerId, items } = data;

  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  }

  return prisma.$transaction(async (tx) => {
    // If items are being updated, replace them
    if (items && items.length > 0) {
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      if (products.length !== productIds.length) {
        throw Object.assign(new Error('One or more products not found'), { statusCode: 404 });
      }
      const productMap = new Map(products.map((p) => [p.id, p]));
      const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

      // Delete old items and recreate
      await tx.challanItem.deleteMany({ where: { challanId: id } });
      await tx.challan.update({
        where: { id },
        data: {
          customerId: customerId ?? challan.customerId,
          totalQuantity,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                productNameSnapshot: product.name,
                skuSnapshot: product.sku,
                unitPriceSnapshot: product.unitPrice,
                quantity: item.quantity,
              };
            }),
          },
        },
      });
    } else if (customerId) {
      await tx.challan.update({ where: { id }, data: { customerId } });
    }

    return tx.challan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        items: true,
      },
    });
  });
};

// ─── CONFIRM (CRITICAL BUSINESS LOGIC) ───────────────────────────────────────
export const confirmChallan = async (id: string, userId: string) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!challan) throw Object.assign(new Error('Challan not found'), { statusCode: 404 });
  if (challan.status === 'CONFIRMED') {
    throw Object.assign(new Error('Challan is already confirmed'), { statusCode: 400 });
  }
  if (challan.status === 'CANCELLED') {
    throw Object.assign(new Error('Cannot confirm a cancelled challan'), { statusCode: 400 });
  }

  // Fetch current stock for all products in one query
  const productIds = challan.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // ── STOCK CHECK (before opening transaction) ──────────────────
  const insufficientItems: string[] = [];
  for (const item of challan.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      insufficientItems.push(`Product ${item.productId} not found`);
    } else if (product.currentStock < item.quantity) {
      insufficientItems.push(
        `"${product.name}" (SKU: ${product.sku}) — available: ${product.currentStock}, requested: ${item.quantity}`
      );
    }
  }

  if (insufficientItems.length > 0) {
    throw Object.assign(
      new Error(`Insufficient stock for: ${insufficientItems.join(' | ')}`),
      { statusCode: 400 }
    );
  }

  // ── ATOMIC TRANSACTION ────────────────────────────────────────
  return prisma.$transaction(async (tx) => {
    // Re-check stock inside transaction to prevent race conditions
    for (const item of challan.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.currentStock < item.quantity) {
        throw Object.assign(
          new Error(
            `Race condition: insufficient stock for "${product?.name ?? item.productId}" at commit time`
          ),
          { statusCode: 400 }
        );
      }

      // Decrease stock
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });

      // Create OUT movement
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: 'OUT',
          reason: `Challan ${challan.challanNumber} confirmed`,
          createdBy: userId,
        },
      });
    }

    // Confirm the challan
    return tx.challan.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        customer: { select: { id: true, name: true } },
        items: true,
      },
    });
  });
};

// ─── CANCEL ───────────────────────────────────────────────────────────────────
export const cancelChallan = async (id: string) => {
  const challan = await prisma.challan.findUnique({ where: { id } });
  if (!challan) throw Object.assign(new Error('Challan not found'), { statusCode: 404 });
  if (challan.status === 'CANCELLED') {
    throw Object.assign(new Error('Challan is already cancelled'), { statusCode: 400 });
  }
  if (challan.status === 'CONFIRMED') {
    throw Object.assign(new Error('Cannot cancel a confirmed challan'), { statusCode: 400 });
  }

  return prisma.challan.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      customer: { select: { id: true, name: true } },
      items: true,
    },
  });
};

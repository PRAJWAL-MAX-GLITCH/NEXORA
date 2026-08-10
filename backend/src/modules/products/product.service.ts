import prisma from '../../config/db';
import type { CreateProductInput, UpdateProductInput, ProductQuery } from './product.validation';

export const createProduct = async (data: CreateProductInput) => {
  const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existing) {
    throw Object.assign(new Error(`SKU "${data.sku}" already exists`), { statusCode: 409 });
  }
  return prisma.product.create({ data });
};

export const getProducts = async (query: ProductQuery) => {
  const { page, limit, search, category } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) where.category = { contains: category, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({ where: { id } });
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};



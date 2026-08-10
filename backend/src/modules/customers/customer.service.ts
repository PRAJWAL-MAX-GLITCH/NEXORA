import prisma from '../../config/db';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerQuery } from './customer.validation';

export const createCustomer = async (data: CreateCustomerInput) => {
  return prisma.customer.create({
    data: {
      ...data,
      email: data.email || null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    },
  });
};

export const getCustomers = async (query: CustomerQuery) => {
  const { page, limit, search, status, customerType } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (customerType) where.customerType = customerType;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerById = async (id: string) => {
  return prisma.customer.findUnique({ where: { id } });
};

export const updateCustomer = async (id: string, data: UpdateCustomerInput) => {
  return prisma.customer.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : data.followUpDate === '' ? null : undefined,
    },
  });
};

export const deleteCustomer = async (id: string) => {
  return prisma.customer.delete({ where: { id } });
};

import { Request, Response } from 'express';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from './customer.validation';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from './customer.service';
import { sendSuccess, sendError } from '../../utils/response';

export const create = async (req: Request, res: Response) => {
  const data = createCustomerSchema.parse(req.body);
  const customer = await createCustomer(data);
  return sendSuccess(res, customer, 201);
};

export const list = async (req: Request, res: Response) => {
  const query = customerQuerySchema.parse(req.query);
  const result = await getCustomers(query);
  return sendSuccess(res, result);
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const customer = await getCustomerById(id);
  if (!customer) return sendError(res, 'Customer not found', 404);
  return sendSuccess(res, customer);
};

export const update = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await getCustomerById(id);
  if (!existing) return sendError(res, 'Customer not found', 404);

  const data = updateCustomerSchema.parse(req.body);
  const customer = await updateCustomer(id, data);
  return sendSuccess(res, customer);
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await getCustomerById(id);
  if (!existing) return sendError(res, 'Customer not found', 404);

  await deleteCustomer(id);
  return sendSuccess(res, { message: 'Customer deleted successfully' });
};

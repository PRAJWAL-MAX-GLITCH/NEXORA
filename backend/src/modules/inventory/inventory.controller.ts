import { Request, Response } from 'express';
import {
  stockInSchema,
  stockOutSchema,
  movementQuerySchema,
} from './inventory.validation';
import {
  stockIn,
  stockOut,
  getMovements,
  getLowStockProducts,
} from './inventory.service';
import { sendSuccess, sendError } from '../../utils/response';

export const handleStockIn = async (req: Request, res: Response) => {
  const data = stockInSchema.parse(req.body);
  const userId = (req as any).user.id as string;
  try {
    const result = await stockIn(data, userId);
    return sendSuccess(res, result, 201);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

export const handleStockOut = async (req: Request, res: Response) => {
  const data = stockOutSchema.parse(req.body);
  const userId = (req as any).user.id as string;
  try {
    const result = await stockOut(data, userId);
    return sendSuccess(res, result, 201);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

export const listMovements = async (req: Request, res: Response) => {
  const query = movementQuerySchema.parse(req.query);
  const result = await getMovements(query);
  return sendSuccess(res, result);
};

export const lowStock = async (req: Request, res: Response) => {
  const products = await getLowStockProducts();
  return sendSuccess(res, { products, total: products.length });
};

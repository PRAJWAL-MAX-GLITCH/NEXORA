import { Request, Response } from 'express';
import {
  createChallanSchema,
  updateChallanSchema,
  challanQuerySchema,
} from './challan.validation';
import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from './challan.service';
import { sendSuccess, sendError } from '../../utils/response';

export const create = async (req: Request, res: Response) => {
  const data = createChallanSchema.parse(req.body);
  const userId = (req as any).user.id as string;
  try {
    const challan = await createChallan(data, userId);
    return sendSuccess(res, challan, 201);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

export const list = async (req: Request, res: Response) => {
  const query = challanQuerySchema.parse(req.query);
  const result = await getChallans(query);
  return sendSuccess(res, result);
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const challan = await getChallanById(id);
  if (!challan) return sendError(res, 'Challan not found', 404);
  return sendSuccess(res, challan);
};

export const update = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = updateChallanSchema.parse(req.body);
  const userId = (req as any).user.id as string;
  try {
    const challan = await updateChallan(id, data, userId);
    return sendSuccess(res, challan);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

export const confirm = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const userId = (req as any).user.id as string;
  try {
    const challan = await confirmChallan(id, userId);
    return sendSuccess(res, challan);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

export const cancel = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  try {
    const challan = await cancelChallan(id);
    return sendSuccess(res, challan);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

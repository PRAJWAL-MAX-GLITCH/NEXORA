import { Request, Response } from 'express';
import { loginUser } from './auth.service';
import { loginSchema } from './auth.validation';
import { sendSuccess, sendError } from '../../utils/response';

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const result = await loginUser(email, password);
  if (!result) {
    return sendError(res, 'Invalid email or password', 401);
  }

  return sendSuccess(res, result);
};

export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user;
  return sendSuccess(res, user);
};

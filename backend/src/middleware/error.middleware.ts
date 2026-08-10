import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const message = (err as ZodError).issues
      .map((issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    return sendError(res, message, 400);
  }

  console.error(err);
  return sendError(res, 'Internal Server Error', 500);
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export const authenticate = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Unauthorized: Missing or invalid token', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Unauthorized: Missing token', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      (req as any).user = decoded;
      next();
    } catch (error) {
      return sendError(res, 'Unauthorized: Invalid token', 401);
    }
  };
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return sendError(res, 'Unauthorized: Missing user payload', 401);
    }

    if (!roles.includes(user.role)) {
      console.error(`[AUTH 403] Path: ${req.originalUrl} | User Role: ${user.role} | Allowed: ${roles.join(',')}`);
      return sendError(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};

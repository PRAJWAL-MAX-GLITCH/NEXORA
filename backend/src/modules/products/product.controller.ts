import { Request, Response } from 'express';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from './product.validation';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from './product.service';
import { sendSuccess, sendError } from '../../utils/response';

export const create = async (req: Request, res: Response) => {
  const data = createProductSchema.parse(req.body);
  try {
    const product = await createProduct(data);
    return sendSuccess(res, product, 201);
  } catch (err: any) {
    return sendError(res, err.message, err.statusCode || 500);
  }
};

export const list = async (req: Request, res: Response) => {
  const query = productQuerySchema.parse(req.query);
  const result = await getProducts(query);
  return sendSuccess(res, result);
};

export const getOne = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const product = await getProductById(id);
  if (!product) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, product);
};

export const update = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await getProductById(id);
  if (!existing) return sendError(res, 'Product not found', 404);

  const data = updateProductSchema.parse(req.body);
  const product = await updateProduct(id, data);
  return sendSuccess(res, product);
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await getProductById(id);
  if (!existing) return sendError(res, 'Product not found', 404);

  try {
    await deleteProduct(id);
    return sendSuccess(res, { message: 'Product deleted successfully' });
  } catch (err: any) {
    // FK constraint — product has stock movements
    if (err?.message?.includes('foreign key') || err?.code === 'P2003' || err?.message?.includes('RESTRICT')) {
      return sendError(res, 'Cannot delete product with existing stock movements. Archive it instead.', 409);
    }
    throw err;
  }
};

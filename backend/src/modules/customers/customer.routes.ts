import { Router } from 'express';
import { create, list, getOne, update, remove } from './customer.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate());

// GET /api/customers — ADMIN, SALES, WAREHOUSE, ACCOUNTS (all roles can read)
router.get('/', asyncHandler(list));

// GET /api/customers/:id — all roles
router.get('/:id', asyncHandler(getOne));

// POST /api/customers — ADMIN, SALES only
router.post('/', authorize('ADMIN', 'SALES'), asyncHandler(create));

// PUT /api/customers/:id — ADMIN, SALES only
router.put('/:id', authorize('ADMIN', 'SALES'), asyncHandler(update));

// DELETE /api/customers/:id — ADMIN only
router.delete('/:id', authorize('ADMIN'), asyncHandler(remove));

export default router;

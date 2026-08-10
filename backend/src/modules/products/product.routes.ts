import { Router } from 'express';
import { create, list, getOne, update, remove } from './product.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate());

// GET — all roles can read
router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(getOne));

// POST — ADMIN, WAREHOUSE
router.post('/', authorize('ADMIN', 'WAREHOUSE'), asyncHandler(create));

// PUT — ADMIN, WAREHOUSE
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), asyncHandler(update));

// DELETE — ADMIN only
router.delete('/:id', authorize('ADMIN'), asyncHandler(remove));

export default router;

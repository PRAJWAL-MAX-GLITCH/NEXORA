import { Router } from 'express';
import { create, list, getOne, update, confirm, cancel } from './challan.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate());

// List + Get — ADMIN, SALES, ACCOUNTS can view challans
router.get('/', authorize('ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'), asyncHandler(list));
router.get('/:id', authorize('ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'), asyncHandler(getOne));

// Create + Update — ADMIN, SALES
router.post('/', authorize('ADMIN', 'SALES'), asyncHandler(create));
router.put('/:id', authorize('ADMIN', 'SALES'), asyncHandler(update));

// Confirm — ADMIN, WAREHOUSE (warehouse physically verifies stock)
router.post('/:id/confirm', authorize('ADMIN', 'WAREHOUSE'), asyncHandler(confirm));

// Cancel — ADMIN, SALES
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), asyncHandler(cancel));

export default router;

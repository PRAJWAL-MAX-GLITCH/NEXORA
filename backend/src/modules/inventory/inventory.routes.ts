import { Router } from 'express';
import { handleStockIn, handleStockOut, listMovements, lowStock } from './inventory.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate());

// Stock IN — ADMIN, WAREHOUSE
router.post('/stock-in', authorize('ADMIN', 'WAREHOUSE'), asyncHandler(handleStockIn));

// Stock OUT — ADMIN, WAREHOUSE, SALES (for dispatch)
router.post('/stock-out', authorize('ADMIN', 'WAREHOUSE', 'SALES'), asyncHandler(handleStockOut));

// View movements — all roles
router.get('/movements', asyncHandler(listMovements));

// Low stock alert — ADMIN, WAREHOUSE, ACCOUNTS
router.get('/low-stock', authorize('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), asyncHandler(lowStock));

export default router;

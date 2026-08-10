import { Router } from 'express';
import { login, getMe } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/me', authenticate(), asyncHandler(getMe));

export default router;

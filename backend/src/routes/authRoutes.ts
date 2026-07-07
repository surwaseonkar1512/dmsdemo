import { Router } from 'express';
import { login, refreshToken, logout, seedAdmin } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/seed', seedAdmin);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, authenticate, authRateLimiter } from '@realestate/middlewares';
import {
  sendOtpSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
} from '../dtos/auth.dto';

const router = Router();
const controller = new AuthController();

// Public routes
router.post('/otp/send', authRateLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refreshToken);

// Protected routes
router.post('/logout', authenticate, validate(refreshTokenSchema), controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.get('/profile', authenticate, controller.getProfile);

export { router as authRoutes };

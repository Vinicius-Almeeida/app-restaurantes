import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/auth';
import { registerSchema, loginSchema, contextLoginSchema, refreshTokenSchema } from './auth.schema';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);

/**
 * Context-aware login - RECOMMENDED
 * POST /auth/login/context
 *
 * Validates user role against login context:
 * - context: 'customer' -> CUSTOMER only
 * - context: 'restaurant' -> RESTAURANT_OWNER, WAITER, KITCHEN
 * - context: 'admin' -> SUPER_ADMIN, CONSULTANT
 *
 * Returns 403 if role doesn't match context
 */
router.post('/login/context', validate(contextLoginSchema), authController.loginWithContext);

/**
 * Legacy login - DEPRECATED
 * POST /auth/login
 *
 * Does NOT validate role context - kept for backward compatibility
 * Will be removed in future versions
 */
router.post('/login', validate(loginSchema), authController.login);

router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

export default router;

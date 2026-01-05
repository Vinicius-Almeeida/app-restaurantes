import { z } from 'zod';

/**
 * Login context enum - defines which login page is being used
 * This enables backend role validation for proper isolation
 */
export const LoginContext = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  ADMIN: 'admin',
} as const;

export type LoginContextType = typeof LoginContext[keyof typeof LoginContext];

/**
 * Role groups for each login context
 * SECURITY: These define which roles are allowed at each login endpoint
 */
export const ALLOWED_ROLES_BY_CONTEXT = {
  [LoginContext.CUSTOMER]: ['CUSTOMER'] as const,
  [LoginContext.RESTAURANT]: ['RESTAURANT_OWNER', 'WAITER', 'KITCHEN'] as const,
  [LoginContext.ADMIN]: ['SUPER_ADMIN', 'CONSULTANT'] as const,
} as const;

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    phone: z.string().optional(),
    role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER']).default('CUSTOMER'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

/**
 * Context-aware login schema - includes login context for role validation
 */
export const contextLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    context: z.enum(['customer', 'restaurant', 'admin']),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ContextLoginInput = z.infer<typeof contextLoginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];

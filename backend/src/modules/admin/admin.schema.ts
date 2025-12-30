import { z } from 'zod';

// Dashboard Metrics
export const getDashboardMetricsSchema = z.object({
  query: z.object({
    period: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  }),
});

// Restaurants
export const listRestaurantsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    status: z.enum(['active', 'inactive']).optional(),
    planId: z.string().uuid('Invalid plan ID').optional(),
    search: z.string().optional(),
  }),
});

export const getRestaurantDetailsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid restaurant ID'),
  }),
});

// Users
export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    role: z.enum(['ADMIN', 'SUPER_ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER', 'CONSULTANT']).optional(),
    search: z.string().optional(),
  }),
});

export const getUserDetailsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'SUPER_ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER', 'CONSULTANT']),
  }),
});

// Plans
export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().optional(),
    price: z.number().nonnegative('Price must be non-negative'),
    billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
    maxTables: z.number().int().positive().optional(),
    maxMenuItems: z.number().int().positive().optional(),
    maxStaff: z.number().int().positive().optional(),
    platformFeePercent: z.number().min(0).max(100, 'Platform fee must be between 0 and 100'),
    features: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
    displayOrder: z.number().int().nonnegative().default(0),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional(),
    maxTables: z.number().int().positive().optional(),
    maxMenuItems: z.number().int().positive().optional(),
    maxStaff: z.number().int().positive().optional(),
    platformFeePercent: z.number().min(0).max(100).optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().nonnegative().optional(),
  }),
});

export const getPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID'),
  }),
});

// Subscriptions
export const listSubscriptionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL']).optional(),
    planId: z.string().uuid('Invalid plan ID').optional(),
    restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  }),
});

export const updateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID'),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL']).optional(),
    planId: z.string().uuid('Invalid plan ID').optional(),
    trialEndsAt: z.string().datetime().optional(),
    currentPeriodEnd: z.string().datetime().optional(),
  }),
});

export const getSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID'),
  }),
});

// Consultants
export const createConsultantSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    commissionPercent: z.number().min(0).max(100, 'Commission must be between 0 and 100'),
  }),
});

export const updateConsultantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid consultant ID'),
  }),
  body: z.object({
    commissionPercent: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getConsultantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid consultant ID'),
  }),
});

// Platform Settings
export const updatePlatformSettingsSchema = z.object({
  body: z.object({
    defaultPlatformFeePercent: z.number().min(0).max(100).optional(),
    defaultTrialDays: z.number().int().nonnegative().optional(),
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().optional(),
  }),
});

// Type exports
export type GetDashboardMetricsInput = z.infer<typeof getDashboardMetricsSchema>['query'];
export type ListRestaurantsInput = z.infer<typeof listRestaurantsSchema>['query'];
export type GetRestaurantDetailsInput = z.infer<typeof getRestaurantDetailsSchema>['params'];
export type ListUsersInput = z.infer<typeof listUsersSchema>['query'];
export type GetUserDetailsInput = z.infer<typeof getUserDetailsSchema>['params'];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>['body'];
export type CreatePlanInput = z.infer<typeof createPlanSchema>['body'];
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>['body'];
export type ListSubscriptionsInput = z.infer<typeof listSubscriptionsSchema>['query'];
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>['body'];
export type CreateConsultantInput = z.infer<typeof createConsultantSchema>['body'];
export type UpdateConsultantInput = z.infer<typeof updateConsultantSchema>['body'];
export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>['body'];

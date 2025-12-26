import { z } from 'zod';

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Restaurant name must be at least 3 characters'),
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    logoUrl: z.string().url().optional(),
    coverUrl: z.string().url().optional(),

    // Address
    addressStreet: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
    addressZip: z.string().optional(),
    addressCountry: z.string().default('Brasil'),

    // Contact
    phone: z.string().optional(),
    email: z.string().email().optional(),

    // Settings
    currency: z.string().default('BRL'),
    operatingHours: z.record(z.object({
      open: z.string(),
      close: z.string(),
    })).optional(),
  }),
});

export const updateRestaurantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid restaurant ID'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    logoUrl: z.string().url().optional(),
    coverUrl: z.string().url().optional(),

    addressStreet: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
    addressZip: z.string().optional(),
    addressCountry: z.string().optional(),

    phone: z.string().optional(),
    email: z.string().email().optional(),

    isActive: z.boolean().optional(),
    acceptsOrders: z.boolean().optional(),
    currency: z.string().optional(),
    operatingHours: z.record(z.object({
      open: z.string(),
      close: z.string(),
    })).optional(),
  }),
});

export const getRestaurantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid restaurant ID'),
  }),
});

export const deleteRestaurantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid restaurant ID'),
  }),
});

export const getRestaurantBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(3, 'Invalid slug'),
  }),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>['body'];
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>['body'];

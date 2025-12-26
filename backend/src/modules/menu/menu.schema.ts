import { z } from 'zod';

// ============================================
// MENU CATEGORIES
// ============================================
export const createCategorySchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().optional(),
    displayOrder: z.number().int().default(0),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============================================
// MENU ITEMS
// ============================================
export const createMenuItemSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    name: z.string().min(2, 'Item name must be at least 2 characters'),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    price: z.number().positive('Price must be a positive number'),

    // Nutritional info
    calories: z.number().int().positive().optional(),
    allergens: z.array(z.string()).optional(),

    // Availability
    stockQuantity: z.number().int().nonnegative().optional(),

    // Customizations
    customizations: z.record(z.array(z.string())).optional(),

    displayOrder: z.number().int().default(0),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid menu item ID'),
  }),
  body: z.object({
    categoryId: z.string().uuid().optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    price: z.number().positive().optional(),
    calories: z.number().int().positive().optional(),
    allergens: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    customizations: z.record(z.array(z.string())).optional(),
    displayOrder: z.number().int().optional(),
  }),
});

export const getMenuItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid menu item ID'),
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

export const getMenuByRestaurantSchema = z.object({
  params: z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>['body'];
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>['body'];

import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    tableNumber: z.string().optional(),
    items: z.array(
      z.object({
        menuItemId: z.string().uuid('Invalid menu item ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
        customizations: z.record(z.any()).optional(),
        notes: z.string().optional(),
        isShared: z.boolean().default(false),
        sharedWith: z.array(z.string().uuid()).optional(),
      })
    ).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    taxAmount: z.number().nonnegative().default(0),
    discountAmount: z.number().nonnegative().default(0),
  }),
});

export const addItemToOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    menuItemId: z.string().uuid('Invalid menu item ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
    customizations: z.record(z.any()).optional(),
    notes: z.string().optional(),
    isShared: z.boolean().default(false),
    sharedWith: z.array(z.string().uuid()).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
  }),
});

export const addParticipantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    userId: z.string().uuid().optional(),
    guestName: z.string().optional(),
    guestEmail: z.string().email().optional(),
  }).refine(
    (data) => data.userId || (data.guestName && data.guestEmail),
    'Either userId or guestName+guestEmail must be provided'
  ),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type AddItemToOrderInput = z.infer<typeof addItemToOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type AddParticipantInput = z.infer<typeof addParticipantSchema>['body'];

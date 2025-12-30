/**
 * Kitchen Module - Zod Validation Schemas
 * FAANG-level type safety for kitchen operations
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const OrderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
]);

export const OrderPriorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Schema for getting orders by status
 */
export const getOrdersQuerySchema = z.object({
  status: OrderStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;

/**
 * Schema for restaurant ID param
 */
export const restaurantIdParamSchema = z.object({
  restaurantId: z.string().uuid('ID do restaurante inválido'),
});

export type RestaurantIdParam = z.infer<typeof restaurantIdParamSchema>;

/**
 * Schema for order ID param
 */
export const orderIdParamSchema = z.object({
  orderId: z.string().uuid('ID do pedido inválido'),
});

export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

/**
 * Schema for starting an order (mark as PREPARING)
 */
export const startOrderSchema = z.object({
  estimatedMinutes: z.number().int().positive().max(180).optional(),
});

export type StartOrderInput = z.infer<typeof startOrderSchema>;

/**
 * Schema for marking order as ready
 */
export const markOrderReadySchema = z.object({
  notes: z.string().max(500).optional(),
});

export type MarkOrderReadyInput = z.infer<typeof markOrderReadySchema>;

/**
 * Schema for updating order priority
 */
export const updatePrioritySchema = z.object({
  priority: OrderPriorityEnum,
});

export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export type OrderPriority = z.infer<typeof OrderPriorityEnum>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

/**
 * Kitchen order item structure
 */
export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes: string | null;
  customizations: Record<string, unknown> | null;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

/**
 * Kitchen order structure for Kanban display
 */
export interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber: string | null;
  status: OrderStatus;
  items: KitchenOrderItem[];
  priority: OrderPriority;
  createdAt: string;
  confirmedAt: string | null;
  startedAt: string | null;
  estimatedReadyAt: string | null;
  totalItems: number;
  customerName: string | null;
  notes: string | null;
}

/**
 * Kitchen statistics
 */
export interface KitchenStats {
  ordersToday: number;
  avgPrepTimeMinutes: number;
  ordersPerHour: number;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  deliveredToday: number;
  cancelledToday: number;
}

/**
 * Active orders grouped by status for Kanban
 */
export interface ActiveOrdersResponse {
  pending: KitchenOrder[];
  confirmed: KitchenOrder[];
  preparing: KitchenOrder[];
  ready: KitchenOrder[];
  stats: KitchenStats;
}

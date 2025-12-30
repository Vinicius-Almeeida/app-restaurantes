/**
 * Waiter Module - Zod Validation Schemas
 * FAANG-level type safety for waiter operations
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const WaiterCallStatusEnum = z.enum(['PENDING', 'ACKNOWLEDGED', 'COMPLETED', 'EXPIRED']);
export const WaiterCallPriorityEnum = z.enum(['NORMAL', 'URGENT']);
export const OrderStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']);

export type WaiterCallStatus = z.infer<typeof WaiterCallStatusEnum>;
export type WaiterCallPriority = z.infer<typeof WaiterCallPriorityEnum>;

// ============================================
// REQUEST SCHEMAS
// ============================================

export const restaurantIdParamSchema = z.object({
  restaurantId: z.string().uuid('ID do restaurante inválido'),
});

export type RestaurantIdParam = z.infer<typeof restaurantIdParamSchema>;

export const callIdParamSchema = z.object({
  callId: z.string().uuid('ID da chamada inválido'),
});

export type CallIdParam = z.infer<typeof callIdParamSchema>;

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid('ID do pedido inválido'),
});

export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

/**
 * Schema for creating a waiter call
 */
export const createWaiterCallSchema = z.object({
  sessionId: z.string().uuid('ID da sessão inválido'),
  tableNumber: z.number().int().positive('Número da mesa deve ser positivo'),
  reason: z.string().max(200).optional(),
  priority: WaiterCallPriorityEnum.default('NORMAL'),
});

export type CreateWaiterCallInput = z.infer<typeof createWaiterCallSchema>;

/**
 * Schema for acknowledging a waiter call
 */
export const acknowledgeCallSchema = z.object({
  waiterId: z.string().uuid('ID do garçom inválido').optional(),
});

export type AcknowledgeCallInput = z.infer<typeof acknowledgeCallSchema>;

/**
 * Schema for filtering waiter calls
 */
export const getCallsQuerySchema = z.object({
  status: WaiterCallStatusEnum.optional(),
  priority: WaiterCallPriorityEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type GetCallsQuery = z.infer<typeof getCallsQuerySchema>;

/**
 * Schema for filtering tables
 */
export const getTablesQuerySchema = z.object({
  hasActiveSession: z.coerce.boolean().optional(),
  hasReadyOrders: z.coerce.boolean().optional(),
});

export type GetTablesQuery = z.infer<typeof getTablesQuerySchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface WaiterCall {
  id: string;
  restaurantId: string;
  sessionId: string;
  tableNumber: number;
  reason: string | null;
  status: WaiterCallStatus;
  priority: WaiterCallPriority;
  waiterId: string | null;
  waiterName: string | null;
  calledAt: string;
  acknowledgedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
}

export interface TableWithSession {
  id: string;
  number: number;
  capacity: number;
  isActive: boolean;
  qrCode: string;
  session: {
    id: string;
    status: string;
    memberCount: number;
    orderCount: number;
    totalAmount: number;
    startedAt: string;
  } | null;
  hasPendingCall: boolean;
  hasReadyOrders: boolean;
  readyOrdersCount: number;
}

export interface ReadyOrder {
  id: string;
  orderNumber: string;
  tableNumber: string | null;
  tableId: string | null;
  status: string;
  items: {
    id: string;
    name: string;
    quantity: number;
  }[];
  totalItems: number;
  readyAt: string;
  customerName: string | null;
}

export interface WaiterDashboardData {
  tables: TableWithSession[];
  pendingCalls: WaiterCall[];
  readyOrders: ReadyOrder[];
  stats: WaiterStats;
}

export interface WaiterStats {
  activeTables: number;
  totalTables: number;
  pendingCalls: number;
  readyOrders: number;
  deliveredToday: number;
  avgResponseTime: number;
}

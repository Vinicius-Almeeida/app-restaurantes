/**
 * Kitchen API Client
 * FAANG-level type-safe API calls for kitchen operations
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes: string | null;
  customizations: Record<string, unknown> | null;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

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

export interface ActiveOrdersResponse {
  pending: KitchenOrder[];
  confirmed: KitchenOrder[];
  preparing: KitchenOrder[];
  ready: KitchenOrder[];
  stats: KitchenStats;
}

export interface StartOrderInput {
  estimatedMinutes?: number;
}

export interface MarkOrderReadyInput {
  notes?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all active orders for Kanban board
 */
export async function getActiveOrders(restaurantId: string): Promise<ActiveOrdersResponse> {
  const response = await apiClient.get(`/kitchen/${restaurantId}/orders`);
  return response.data.data;
}

/**
 * Get orders with pagination and status filter
 */
export async function getOrdersByStatus(
  restaurantId: string,
  params?: { status?: OrderStatus; page?: number; limit?: number }
): Promise<{ orders: KitchenOrder[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const response = await apiClient.get(`/kitchen/${restaurantId}/orders/list`, { params });
  return { orders: response.data.data, pagination: response.data.pagination };
}

/**
 * Get single order details
 */
export async function getOrderById(restaurantId: string, orderId: string): Promise<KitchenOrder> {
  const response = await apiClient.get(`/kitchen/${restaurantId}/orders/${orderId}`);
  return response.data.data;
}

/**
 * Get kitchen statistics
 */
export async function getStats(restaurantId: string): Promise<KitchenStats> {
  const response = await apiClient.get(`/kitchen/${restaurantId}/stats`);
  return response.data.data;
}

/**
 * Confirm order (PENDING -> CONFIRMED)
 */
export async function confirmOrder(restaurantId: string, orderId: string): Promise<KitchenOrder> {
  const response = await apiClient.post(`/kitchen/${restaurantId}/orders/${orderId}/confirm`);
  return response.data.data;
}

/**
 * Start preparing order (CONFIRMED -> PREPARING)
 */
export async function startOrder(
  restaurantId: string,
  orderId: string,
  data?: StartOrderInput
): Promise<KitchenOrder> {
  const response = await apiClient.post(`/kitchen/${restaurantId}/orders/${orderId}/start`, data);
  return response.data.data;
}

/**
 * Mark order as ready (PREPARING -> READY)
 */
export async function markOrderReady(
  restaurantId: string,
  orderId: string,
  data?: MarkOrderReadyInput
): Promise<KitchenOrder> {
  const response = await apiClient.post(`/kitchen/${restaurantId}/orders/${orderId}/ready`, data);
  return response.data.data;
}

/**
 * Cancel order
 */
export async function cancelOrder(
  restaurantId: string,
  orderId: string,
  reason?: string
): Promise<KitchenOrder> {
  const response = await apiClient.post(`/kitchen/${restaurantId}/orders/${orderId}/cancel`, { reason });
  return response.data.data;
}

export const kitchenApi = {
  getActiveOrders,
  getOrdersByStatus,
  getOrderById,
  getStats,
  confirmOrder,
  startOrder,
  markOrderReady,
  cancelOrder,
};

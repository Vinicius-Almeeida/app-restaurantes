/**
 * Waiter API Client
 * FAANG-level type-safe API calls for waiter operations
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export type WaiterCallStatus = 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED' | 'EXPIRED';
export type WaiterCallPriority = 'NORMAL' | 'URGENT';

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

export interface WaiterStats {
  activeTables: number;
  totalTables: number;
  pendingCalls: number;
  readyOrders: number;
  deliveredToday: number;
  avgResponseTime: number;
}

export interface WaiterDashboardData {
  tables: TableWithSession[];
  pendingCalls: WaiterCall[];
  readyOrders: ReadyOrder[];
  stats: WaiterStats;
}

export interface CreateWaiterCallInput {
  sessionId: string;
  tableNumber: number;
  reason?: string;
  priority?: WaiterCallPriority;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get full waiter dashboard data
 */
export async function getDashboard(restaurantId: string): Promise<WaiterDashboardData> {
  const response = await apiClient.get(`/waiter/${restaurantId}/dashboard`);
  return response.data.data;
}

/**
 * Get all tables with session info
 */
export async function getTables(
  restaurantId: string,
  params?: { hasActiveSession?: boolean; hasReadyOrders?: boolean }
): Promise<TableWithSession[]> {
  const response = await apiClient.get(`/waiter/${restaurantId}/tables`, { params });
  return response.data.data;
}

/**
 * Get all ready orders awaiting delivery
 */
export async function getReadyOrders(restaurantId: string): Promise<ReadyOrder[]> {
  const response = await apiClient.get(`/waiter/${restaurantId}/ready-orders`);
  return response.data.data;
}

/**
 * Mark order as delivered
 */
export async function deliverOrder(restaurantId: string, orderId: string): Promise<ReadyOrder> {
  const response = await apiClient.post(`/waiter/${restaurantId}/orders/${orderId}/deliver`);
  return response.data.data;
}

/**
 * Get waiter calls with filters
 */
export async function getCalls(
  restaurantId: string,
  params?: { status?: WaiterCallStatus; priority?: WaiterCallPriority; page?: number; limit?: number }
): Promise<{ calls: WaiterCall[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const response = await apiClient.get(`/waiter/${restaurantId}/calls`, { params });
  return { calls: response.data.data, pagination: response.data.pagination };
}

/**
 * Create a waiter call (customer calling waiter)
 */
export async function createCall(restaurantId: string, data: CreateWaiterCallInput): Promise<WaiterCall> {
  const response = await apiClient.post(`/waiter/${restaurantId}/calls`, data);
  return response.data.data;
}

/**
 * Acknowledge a waiter call
 */
export async function acknowledgeCall(restaurantId: string, callId: string): Promise<WaiterCall> {
  const response = await apiClient.post(`/waiter/${restaurantId}/calls/${callId}/acknowledge`);
  return response.data.data;
}

/**
 * Complete a waiter call
 */
export async function completeCall(restaurantId: string, callId: string): Promise<WaiterCall> {
  const response = await apiClient.post(`/waiter/${restaurantId}/calls/${callId}/complete`);
  return response.data.data;
}

/**
 * Get waiter statistics
 */
export async function getStats(restaurantId: string): Promise<WaiterStats> {
  const response = await apiClient.get(`/waiter/${restaurantId}/stats`);
  return response.data.data;
}

export const waiterApi = {
  getDashboard,
  getTables,
  getReadyOrders,
  deliverOrder,
  getCalls,
  createCall,
  acknowledgeCall,
  completeCall,
  getStats,
};

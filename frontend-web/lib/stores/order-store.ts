/**
 * Order Store
 * Zustand store for order state management with Socket.IO integration
 */

import { create } from 'zustand';
import type { Order, OrderStatus } from '../types';

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentOrder: (order: Order | null) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentOrder: null,
  orders: [],
  isLoading: false,
  error: null,
};

export const useOrderStore = create<OrderState>((set) => ({
  ...initialState,

  setCurrentOrder: (order) => set({ currentOrder: order, error: null }),

  setOrders: (orders) => set({ orders, error: null }),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status }
          : state.currentOrder,
    })),

  updateOrder: (orderId, updates) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      ),
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, ...updates }
          : state.currentOrder,
    })),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
      currentOrder:
        state.currentOrder?.id === orderId ? null : state.currentOrder,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

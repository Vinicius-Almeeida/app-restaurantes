'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GastroStore,
  GastroState,
  MenuItem,
  CartItem,
  Order,
  OrderItem,
  User,
  UserRole,
  OrderStatus,
  GastroView,
  CategoryId,
  TableStatus,
  WaiterCall,
} from '../types';
import { initialMenuItems, initialRestaurant, initialWaiters, initialKitchenUsers, adminUser } from './initial-data';
import { SERVICE_FEE_PERCENT, WAITER_CALL_REASONS } from '../constants';

const initialState: GastroState = {
  currentUser: null,
  isAuthenticated: false,
  restaurant: initialRestaurant,
  menuItems: initialMenuItems,
  waiters: initialWaiters,
  kitchenUsers: initialKitchenUsers,
  cart: [],
  orders: [],
  waiterCalls: [],
  currentView: 'auth',
  selectedCategory: 'all',
  searchQuery: '',
};

let orderCounter = 1000;

export const useGastroStore = create<GastroStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== AUTH ====================
      login: (email: string, password: string, role: UserRole, tableNumber?: number): boolean => {
        const state = get();

        // Check credentials based on role
        if (role === 'customer') {
          // Customers just need email and table
          if (!tableNumber) return false;

          const user: User = {
            id: `customer-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'customer',
            tableNumber,
          };

          set({
            currentUser: user,
            isAuthenticated: true,
            currentView: 'menu',
          });

          // Update table status
          get().updateTableStatus(tableNumber, 'occupied', user.id);
          return true;
        }

        if (role === 'waiter') {
          const waiter = state.waiters.find(
            (w) => w.email === email && w.active
          );
          if (!waiter) return false;

          set({
            currentUser: waiter,
            isAuthenticated: true,
            currentView: 'waiter-dashboard',
          });
          return true;
        }

        if (role === 'kitchen') {
          const kitchenUser = state.kitchenUsers.find(
            (k) => k.email === email && k.active
          );
          if (!kitchenUser) return false;

          set({
            currentUser: kitchenUser,
            isAuthenticated: true,
            currentView: 'kitchen-dashboard',
          });
          return true;
        }

        if (role === 'admin') {
          if (email === 'admin@bistro.com' && password === '123456') {
            set({
              currentUser: adminUser,
              isAuthenticated: true,
              currentView: 'admin-dashboard',
            });
            return true;
          }
          return false;
        }

        return false;
      },

      logout: () => {
        const state = get();
        const user = state.currentUser;

        // Free up table if customer
        if (user?.role === 'customer' && user.tableNumber) {
          get().updateTableStatus(user.tableNumber, 'available', null);
        }

        set({
          currentUser: null,
          isAuthenticated: false,
          currentView: 'auth',
          cart: [],
        });
      },

      // ==================== CART ====================
      addToCart: (item: MenuItem, quantity = 1, notes = '') => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (c) => c.menuItem.id === item.id && c.notes === notes
          );

          if (existingIndex >= 0) {
            const newCart = [...state.cart];
            newCart[existingIndex] = {
              ...newCart[existingIndex],
              quantity: newCart[existingIndex].quantity + quantity,
              subtotal: (newCart[existingIndex].quantity + quantity) * item.price,
            };
            return { cart: newCart };
          }

          const newCartItem: CartItem = {
            id: Date.now(),
            menuItem: item,
            quantity,
            notes,
            subtotal: quantity * item.price,
          };

          return { cart: [...state.cart, newCartItem] };
        });
      },

      updateCartItem: (itemId: number, quantity: number, notes?: string) => {
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter((c) => c.id !== itemId) };
          }

          return {
            cart: state.cart.map((c) =>
              c.id === itemId
                ? {
                    ...c,
                    quantity,
                    notes: notes ?? c.notes,
                    subtotal: quantity * c.menuItem.price,
                  }
                : c
            ),
          };
        });
      },

      removeFromCart: (itemId: number) => {
        set((state) => ({
          cart: state.cart.filter((c) => c.id !== itemId),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      // ==================== ORDERS ====================
      createOrder: (): Order | null => {
        const state = get();
        const user = state.currentUser;

        if (!user || state.cart.length === 0) return null;

        const orderItems: OrderItem[] = state.cart.map((cartItem) => ({
          id: cartItem.id,
          menuItemId: cartItem.menuItem.id,
          menuItem: cartItem.menuItem,
          quantity: cartItem.quantity,
          notes: cartItem.notes,
          subtotal: cartItem.subtotal,
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const serviceFee = subtotal * SERVICE_FEE_PERCENT;
        const total = subtotal + serviceFee;

        orderCounter += 1;
        const now = new Date();

        const newOrder: Order = {
          id: `order-${orderCounter}`,
          number: orderCounter,
          userId: user.id,
          userName: user.name,
          tableNumber: user.tableNumber ?? 0,
          items: orderItems,
          status: 'pending',
          subtotal,
          serviceFee,
          total,
          createdAt: now,
          updatedAt: now,
          statusHistory: [
            {
              status: 'pending',
              timestamp: now,
            },
          ],
        };

        set((prevState) => ({
          orders: [...prevState.orders, newOrder],
          cart: [],
          currentView: 'tracking',
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        const user = get().currentUser;

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date(),
                  statusHistory: [
                    ...order.statusHistory,
                    {
                      status,
                      timestamp: new Date(),
                      changedBy: user?.name,
                    },
                  ],
                }
              : order
          ),
        }));
      },

      // ==================== WAITER CALLS ====================
      callWaiter: (reasonId: string) => {
        const state = get();
        const user = state.currentUser;
        const reason = WAITER_CALL_REASONS.find((r) => r.id === reasonId);

        if (!user || !user.tableNumber || !reason) return;

        const newCall: WaiterCall = {
          id: `call-${Date.now()}`,
          tableNumber: user.tableNumber,
          reasonId,
          reasonLabel: reason.label,
          timestamp: new Date(),
          handled: false,
        };

        set((prevState) => ({
          waiterCalls: [...prevState.waiterCalls, newCall],
        }));
      },

      handleWaiterCall: (callId: string) => {
        const user = get().currentUser;

        set((state) => ({
          waiterCalls: state.waiterCalls.map((call) =>
            call.id === callId
              ? {
                  ...call,
                  handled: true,
                  handledBy: user?.name,
                }
              : call
          ),
        }));
      },

      // ==================== UI ====================
      setCurrentView: (view: GastroView) => {
        set({ currentView: view });
      },

      setSelectedCategory: (category: CategoryId | 'all') => {
        set({ selectedCategory: category });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // ==================== MENU MANAGEMENT ====================
      updateMenuItem: (itemId: number, updates: Partial<MenuItem>) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      },

      toggleItemAvailability: (itemId: number) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId ? { ...item, available: !item.available } : item
          ),
        }));
      },

      // ==================== TABLE MANAGEMENT ====================
      updateTableStatus: (tableId: number, status: TableStatus, customerId?: string | null) => {
        set((state) => ({
          restaurant: {
            ...state.restaurant,
            tables: state.restaurant.tables.map((table) =>
              table.id === tableId
                ? { ...table, status, currentCustomerId: customerId ?? null }
                : table
            ),
          },
        }));
      },
    }),
    {
      name: 'gastro-storage',
      partialize: (state) => ({
        // Only persist auth and orders
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        orders: state.orders,
      }),
    }
  )
);

// Selector hooks for better performance
export const useCurrentUser = () => useGastroStore((state) => state.currentUser);
export const useIsAuthenticated = () => useGastroStore((state) => state.isAuthenticated);
export const useCart = () => useGastroStore((state) => state.cart);
export const useOrders = () => useGastroStore((state) => state.orders);
export const useMenuItems = () => useGastroStore((state) => state.menuItems);
export const useCurrentView = () => useGastroStore((state) => state.currentView);
export const useWaiterCalls = () => useGastroStore((state) => state.waiterCalls);

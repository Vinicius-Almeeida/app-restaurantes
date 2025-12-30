// Gastro App - TypeScript Types
import type { LucideIcon } from 'lucide-react';

// ==================== ENUMS & BASIC TYPES ====================
export type UserRole = 'customer' | 'waiter' | 'kitchen' | 'admin';
export type OrderStatus = 'pending' | 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type CategoryId = 'entradas' | 'principais' | 'bebidas' | 'sobremesas';
export type TableStatus = 'available' | 'occupied' | 'reserved';
export type SplitMethod = 'equal' | 'by_item' | 'custom' | 'percentage';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

// ==================== CATEGORY ====================
export interface Category {
  id: CategoryId;
  name: string;
  icon: LucideIcon;
  color: string;
}

// ==================== MENU ITEM ====================
export interface MenuItem {
  id: number;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  prepTime: string;
  isPopular?: boolean;
  isVegan?: boolean;
  calories?: number;
  available: boolean;
}

// ==================== CART ====================
export interface CartItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  notes: string;
  subtotal: number;
}

// ==================== ORDER ====================
export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItem: MenuItem;
  quantity: number;
  notes: string;
  subtotal: number;
}

export interface Order {
  id: string;
  number: number;
  userId: string;
  userName: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  serviceFee: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: OrderStatusChange[];
}

export interface OrderStatusChange {
  status: OrderStatus;
  timestamp: Date;
  changedBy?: string;
}

// ==================== ORDER STATUS STEP ====================
export interface OrderStatusStep {
  key: OrderStatus;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

// ==================== USER ====================
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tableNumber?: number;
  active?: boolean;
}

export interface CustomerUser extends User {
  role: 'customer';
  tableNumber: number;
}

export interface WaiterUser extends User {
  role: 'waiter';
  phone: string;
  active: boolean;
}

export interface KitchenUser extends User {
  role: 'kitchen';
  kitchenRole: 'Chef' | 'Auxiliar';
  active: boolean;
}

export interface AdminUser extends User {
  role: 'admin';
}

// ==================== RESTAURANT ====================
export interface Table {
  id: number;
  status: TableStatus;
  currentCustomerId: string | null;
}

export interface Restaurant {
  id: number;
  name: string;
  logo: string;
  address: string;
  phone: string;
  tables: Table[];
}

// ==================== WAITER CALL ====================
export interface WaiterCallReason {
  id: string;
  label: string;
  icon: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  reasonId: string;
  reasonLabel: string;
  timestamp: Date;
  handled: boolean;
  handledBy?: string;
}

// ==================== SPLIT BILL ====================
export interface SplitParticipant {
  id: string;
  name: string;
  items: OrderItem[];
  amount: number;
  paymentStatus: PaymentStatus;
  paymentToken?: string;
}

export interface SplitBill {
  id: string;
  orderId: string;
  method: SplitMethod;
  participants: SplitParticipant[];
  totalAmount: number;
  createdAt: Date;
  expiresAt: Date;
}

// ==================== STORE STATE ====================
export interface GastroState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;

  // Restaurant data
  restaurant: Restaurant;
  menuItems: MenuItem[];

  // Staff
  waiters: WaiterUser[];
  kitchenUsers: KitchenUser[];

  // Cart
  cart: CartItem[];

  // Orders
  orders: Order[];

  // Waiter calls
  waiterCalls: WaiterCall[];

  // UI state
  currentView: GastroView;
  selectedCategory: CategoryId | 'all';
  searchQuery: string;
}

export type GastroView =
  | 'auth'
  | 'menu'
  | 'cart'
  | 'tracking'
  | 'profile'
  | 'waiter-dashboard'
  | 'kitchen-dashboard'
  | 'admin-dashboard';

// ==================== STORE ACTIONS ====================
export interface GastroActions {
  // Auth
  login: (email: string, password: string, role: UserRole, tableNumber?: number) => boolean;
  logout: () => void;

  // Cart
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  updateCartItem: (itemId: number, quantity: number, notes?: string) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;

  // Orders
  createOrder: () => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Waiter calls
  callWaiter: (reasonId: string) => void;
  handleWaiterCall: (callId: string) => void;

  // UI
  setCurrentView: (view: GastroView) => void;
  setSelectedCategory: (category: CategoryId | 'all') => void;
  setSearchQuery: (query: string) => void;

  // Menu management (admin)
  updateMenuItem: (itemId: number, updates: Partial<MenuItem>) => void;
  toggleItemAvailability: (itemId: number) => void;

  // Table management
  updateTableStatus: (tableId: number, status: TableStatus, customerId?: string | null) => void;
}

export type GastroStore = GastroState & GastroActions;

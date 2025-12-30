// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN';
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  acceptsOrders: boolean;
  createdAt: string;
}

// Menu types
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  calories?: number;
  allergens: string[];
  isAvailable: boolean;
  customizations?: Record<string, string[]>;
  displayOrder: number;
}

// Order types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  customizations?: Record<string, any>;
  notes?: string;
  isShared: boolean;
  sharedWith: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurant: Restaurant;
  tableNumber?: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  isSplit: boolean;
  splitCount: number;
  notes?: string;
  orderItems: OrderItem[];
  createdAt: string;
}

// Payment types
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type SplitMethod = 'EQUAL' | 'BY_ITEM' | 'CUSTOM' | 'PERCENTAGE';
export type SplitPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface SplitPayment {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  splitMethod: SplitMethod;
  amountDue: number;
  paymentStatus: SplitPaymentStatus;
  paymentLink?: string;
  paymentToken?: string;
  expiresAt?: string;
  paidAt?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

// Re-export table session types
export * from './table-session';

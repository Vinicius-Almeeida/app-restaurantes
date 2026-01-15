/**
 * Socket.IO Client Instance
 * Singleton pattern with auto-reconnect and authentication
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

// Event payload types (mirror backend types)
export interface NewOrderPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  tableSessionId: string | null;
  tableNumber: string | null;
  status: string;
  subtotal: number;
  totalAmount: number;
  items: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
  }>;
  createdAt: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: string;
  tableNumber: string | null;
}

export interface OrderItemAddedPayload {
  orderId: string;
  orderNumber: string;
  item: {
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
  };
  newSubtotal: number;
  newTotal: number;
}

export interface KitchenOrderPayload {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  tableNumber: string | null;
  items?: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
  }>;
  priority?: string;
  receivedAt?: string;
  startedAt?: string;
  readyAt?: string;
}

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize socket connection with authentication
   */
  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || undefined,
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();

    return this.socket;
  }

  /**
   * Setup connection event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);

      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Authenticate with user data
   */
  authenticate(userId: string, userRole: string, restaurantId?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', { userId, userRole, restaurantId });
      console.log(`[Socket] Authenticated as ${userRole}`);
    }
  }

  /**
   * Update authentication token and reconnect
   */
  updateAuth(token: string): void {
    if (this.socket) {
      this.socket.auth = { token };

      if (!this.socket.connected) {
        this.socket.connect();
      }
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  /**
   * Join a generic room
   */
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
      console.log(`[Socket] Joined room: ${room}`);
    }
  }

  /**
   * Leave a generic room
   */
  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
      console.log(`[Socket] Left room: ${room}`);
    }
  }

  /**
   * Join restaurant room
   */
  joinRestaurant(restaurantId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-restaurant', restaurantId);
      console.log(`[Socket] Joined restaurant: ${restaurantId}`);
    }
  }

  /**
   * Leave restaurant room
   */
  leaveRestaurant(restaurantId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-restaurant', restaurantId);
      console.log(`[Socket] Left restaurant: ${restaurantId}`);
    }
  }

  /**
   * Join kitchen room (for kitchen staff)
   */
  joinKitchen(restaurantId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-kitchen', restaurantId);
      console.log(`[Socket] Joined kitchen: ${restaurantId}`);
    }
  }

  /**
   * Join waiters room (for waiters)
   */
  joinWaiters(restaurantId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-waiters', restaurantId);
      console.log(`[Socket] Joined waiters: ${restaurantId}`);
    }
  }

  /**
   * Join table session room (for customers)
   */
  joinSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-session', sessionId);
      console.log(`[Socket] Joined session: ${sessionId}`);
    }
  }

  /**
   * Leave table session room
   */
  leaveSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-session', sessionId);
      console.log(`[Socket] Left session: ${sessionId}`);
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  /**
   * Listen for new orders
   */
  onNewOrder(callback: (payload: NewOrderPayload) => void): void {
    this.socket?.on('new-order', callback);
  }

  /**
   * Listen for order status changes
   */
  onOrderStatusChanged(callback: (payload: OrderStatusChangedPayload) => void): void {
    this.socket?.on('order-status-changed', callback);
  }

  /**
   * Listen for order item added
   */
  onOrderItemAdded(callback: (payload: OrderItemAddedPayload) => void): void {
    this.socket?.on('order-item-added', callback);
  }

  /**
   * Listen for kitchen order received
   */
  onKitchenOrderReceived(callback: (payload: KitchenOrderPayload) => void): void {
    this.socket?.on('kitchen-order-received', callback);
  }

  /**
   * Listen for kitchen order started
   */
  onKitchenOrderStarted(callback: (payload: KitchenOrderPayload) => void): void {
    this.socket?.on('kitchen-order-started', callback);
  }

  /**
   * Listen for kitchen order ready
   */
  onKitchenOrderReady(callback: (payload: KitchenOrderPayload) => void): void {
    this.socket?.on('kitchen-order-ready', callback);
  }

  /**
   * Remove all event listeners for a specific event
   */
  off(eventName: string): void {
    this.socket?.off(eventName);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

// Singleton instance
export const socketManager = new SocketManager();

// Export socket getter
export const getSocket = () => socketManager.getSocket();

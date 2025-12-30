/**
 * Socket.IO Client Instance
 * Singleton pattern with auto-reconnect and authentication
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Initialize socket connection with authentication
   */
  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Token should be passed from auth store - NEVER from localStorage
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || undefined,
      },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000, // Max 10 seconds
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000, // Connection timeout
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
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
      this.reconnectAttempts = 0; // Reset on successful connection
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        this.disconnect();
      } else {
        // Exponential backoff
        const delay = Math.min(
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
          10000
        );
        console.log(`[Socket] Retrying in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
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
   * Update authentication token and reconnect
   */
  updateAuth(token: string): void {
    if (this.socket) {
      this.socket.auth = { token };

      // Reconnect with new token
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

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
      console.log(`[Socket] Joined room: ${room}`);
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
      console.log(`[Socket] Left room: ${room}`);
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager();

// Export socket getter
export const getSocket = () => socketManager.getSocket();

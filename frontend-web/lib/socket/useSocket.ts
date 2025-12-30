/**
 * Main Socket Hook
 * Provides socket connection management and basic utilities
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from './socket';
import { useAuthStore } from '../stores/auth-store';
import type { SocketState } from './types';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    reconnecting: false,
    error: null,
  });
  const { getAccessToken } = useAuthStore();

  useEffect(() => {
    // Connect on mount with token from auth store
    const token = getAccessToken();
    const socketInstance = socketManager.connect(token || undefined);
    setSocket(socketInstance);

    // Setup state listeners
    const handleConnect = () => {
      setState({
        connected: true,
        reconnecting: false,
        error: null,
      });
    };

    const handleDisconnect = () => {
      setState(prev => ({
        ...prev,
        connected: false,
      }));
    };

    const handleReconnecting = () => {
      setState(prev => ({
        ...prev,
        reconnecting: true,
      }));
    };

    const handleConnectError = (error: Error) => {
      setState(prev => ({
        ...prev,
        error,
        reconnecting: false,
      }));
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.io.on('reconnect_attempt', handleReconnecting);
    socketInstance.on('connect_error', handleConnectError);

    // Cleanup on unmount
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.io.off('reconnect_attempt', handleReconnecting);
      socketInstance.off('connect_error', handleConnectError);
    };
  }, [getAccessToken]);

  /**
   * Join a room
   */
  const joinRoom = useCallback((room: string) => {
    socketManager.joinRoom(room);
  }, []);

  /**
   * Leave a room
   */
  const leaveRoom = useCallback((room: string) => {
    socketManager.leaveRoom(room);
  }, []);

  /**
   * Update authentication token
   */
  const updateAuth = useCallback((token: string) => {
    socketManager.updateAuth(token);
  }, []);

  /**
   * Emit an event
   */
  const emit = useCallback((event: string, data?: unknown) => {
    socket?.emit(event, data);
  }, [socket]);

  /**
   * Listen to an event
   */
  const on = useCallback(<T = unknown>(
    event: string,
    callback: (data: T) => void
  ) => {
    socket?.on(event, callback);

    // Return cleanup function
    return () => {
      socket?.off(event, callback);
    };
  }, [socket]);

  /**
   * Listen to an event once
   */
  const once = useCallback(<T = unknown>(
    event: string,
    callback: (data: T) => void
  ) => {
    socket?.once(event, callback);
  }, [socket]);

  return {
    socket,
    state,
    joinRoom,
    leaveRoom,
    updateAuth,
    emit,
    on,
    once,
  };
}

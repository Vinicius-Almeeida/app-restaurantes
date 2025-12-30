/**
 * Socket Provider Component
 * Initializes socket connection at app level
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { socketManager } from './socket';

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, getAccessToken } = useAuthStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (isAuthenticated) {
      const token = getAccessToken();
      const socket = socketManager.connect(token || undefined);

      // Optional: Log connection events in development
      if (process.env.NODE_ENV === 'development') {
        socket.on('connect', () => {
          console.log('[SocketProvider] Connected to server');
        });

        socket.on('disconnect', (reason) => {
          console.log('[SocketProvider] Disconnected:', reason);
        });
      }
    } else {
      // Disconnect when user logs out
      socketManager.disconnect();
    }

    return () => {
      // Cleanup on unmount (only in strict development mode)
      if (process.env.NODE_ENV === 'development') {
        // Don't disconnect on strict mode double-mount
      }
    };
  }, [isAuthenticated, getAccessToken]);

  return <>{children}</>;
}

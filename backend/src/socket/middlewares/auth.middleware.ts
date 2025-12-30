/**
 * Socket.IO Authentication Middleware
 * Validates JWT tokens and attaches user data to socket
 */

import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyAccessToken, JwtPayload } from '../../utils/jwt';
import { SocketData } from '../types/socket.types';

export interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

/**
 * Authenticates socket connection via JWT token
 * Token must be provided in handshake auth or query
 */
export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
): void => {
  try {
    // Extract token from handshake (auth or query params)
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token as string;

    if (!token) {
      const error = new Error('Authentication token required') as ExtendedError;
      error.data = { code: 'MISSING_TOKEN' };
      return next(error);
    }

    // Verify and decode token
    let payload: JwtPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (verifyError) {
      const error = new Error('Invalid or expired token') as ExtendedError;
      error.data = { code: 'INVALID_TOKEN' };
      return next(error);
    }

    // Attach user data to socket
    socket.data.userId = payload.userId;
    socket.data.userRole = payload.role;
    socket.data.restaurantId = payload.restaurantId;

    console.log(`[Socket Auth] User ${payload.userId} (${payload.role}) authenticated on socket ${socket.id}`);

    next();
  } catch (error) {
    console.error('[Socket Auth] Unexpected error:', error);
    const err = new Error('Authentication failed') as ExtendedError;
    err.data = { code: 'AUTH_ERROR' };
    next(err);
  }
};

/**
 * Verifies user has required role(s)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void): void => {
    const userRole = socket.data.userRole;

    if (!userRole) {
      const error = new Error('User role not found') as ExtendedError;
      error.data = { code: 'MISSING_ROLE' };
      return next(error);
    }

    if (!allowedRoles.includes(userRole)) {
      const error = new Error('Insufficient permissions') as ExtendedError;
      error.data = { code: 'FORBIDDEN', allowedRoles, userRole };
      return next(error);
    }

    next();
  };
};

/**
 * Verifies user belongs to the specified restaurant
 */
export const requireRestaurant = (socket: AuthenticatedSocket, restaurantId: string): boolean => {
  const userRole = socket.data.userRole;
  const userRestaurantId = socket.data.restaurantId;

  // SUPER_ADMIN and CONSULTANT can access all restaurants
  if (userRole === 'SUPER_ADMIN' || userRole === 'CONSULTANT') {
    return true;
  }

  // Restaurant staff must match restaurant ID
  if (userRole === 'RESTAURANT_OWNER' || userRole === 'WAITER' || userRole === 'KITCHEN') {
    return userRestaurantId === restaurantId;
  }

  // Customers don't have restaurant restrictions
  return true;
};

import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler';
import type { RegisterInput, LoginInput, ContextLoginInput, LoginContextType } from './auth.schema';
import { ALLOWED_ROLES_BY_CONTEXT, LoginContext } from './auth.schema';

/**
 * AuthService - Handles authentication with role isolation
 *
 * SECURITY NOTES:
 * - All login methods validate user role against the login context
 * - Generic error messages prevent information leakage about valid accounts
 * - Defense in depth: validation happens both in backend and frontend
 */
export class AuthService {
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role || 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Context-aware login - validates role against login context
   *
   * @param data - Login credentials with context
   * @returns User data and tokens if role matches context
   * @throws AppError 403 if role doesn't match login context
   *
   * SECURITY: This is the primary login method that enforces role isolation
   * OWASP A01:2021 - Broken Access Control prevention
   */
  async loginWithContext(data: ContextLoginInput) {
    const { email, password, context } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedRestaurants: {
          select: { id: true },
          take: 1,
        },
        staffAssignments: {
          select: { restaurantId: true },
          take: 1,
        },
      },
    });

    if (!user) {
      // Generic message to prevent user enumeration
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password first (before role check to prevent timing attacks)
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // SECURITY: Validate role against login context
    const allowedRolesArray: readonly string[] = ALLOWED_ROLES_BY_CONTEXT[context as LoginContextType] ?? [];

    if (!allowedRolesArray.includes(user.role)) {
      // Log security event for monitoring (without sensitive data)
      console.warn(`[SECURITY] Role isolation violation attempt: context=${context}, userRole=${user.role}, email=${email.substring(0, 3)}***`);

      // Generic error message to prevent information leakage
      // Do NOT reveal which login page the user should use
      throw new AppError(403, 'Access denied for this login portal');
    }

    // Get restaurant ID based on role
    let restaurantId: string | undefined;
    if (user.role === 'RESTAURANT_OWNER' && user.ownedRestaurants[0]) {
      restaurantId = user.ownedRestaurants[0].id;
    } else if ((user.role === 'WAITER' || user.role === 'KITCHEN') && user.staffAssignments[0]) {
      restaurantId = user.staffAssignments[0].restaurantId;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        restaurantId,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Legacy login method - kept for backward compatibility
   * WARNING: This method does NOT validate role context
   * Use loginWithContext for new implementations
   *
   * @deprecated Use loginWithContext instead
   */
  async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        ownedRestaurants: {
          select: { id: true },
          take: 1,
        },
        staffAssignments: {
          select: { restaurantId: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Get restaurant ID based on role
    let restaurantId: string | undefined;
    if (user.role === 'RESTAURANT_OWNER' && user.ownedRestaurants[0]) {
      restaurantId = user.ownedRestaurants[0].id;
    } else if ((user.role === 'WAITER' || user.role === 'KITCHEN') && user.staffAssignments[0]) {
      restaurantId = user.staffAssignments[0].restaurantId;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        restaurantId,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Get user from database to ensure they still exist
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          ownedRestaurants: {
            select: { id: true },
            take: 1,
          },
          staffAssignments: {
            select: { restaurantId: true },
            take: 1,
          },
        },
      });

      if (!user) {
        throw new AppError(401, 'User not found');
      }

      // Get restaurant ID based on role
      let restaurantId: string | undefined;
      if (user.role === 'RESTAURANT_OWNER' && user.ownedRestaurants[0]) {
        restaurantId = user.ownedRestaurants[0].id;
      } else if ((user.role === 'WAITER' || user.role === 'KITCHEN') && user.staffAssignments[0]) {
        restaurantId = user.staffAssignments[0].restaurantId;
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId,
      });

      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }
}

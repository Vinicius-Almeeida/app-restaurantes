import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import type { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema';

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data: RegisterInput = req.body;

  const result = await authService.register(data);

  res.status(201).json({
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data: LoginInput = req.body;

  const result = await authService.login(data);

  res.status(200).json({
    message: 'Login successful',
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken }: RefreshTokenInput = req.body;

  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    message: 'Token refreshed successfully',
    data: result,
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // User ID comes from auth middleware
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await authService.getProfile(userId);

  res.status(200).json({
    message: 'Profile retrieved successfully',
    data: user,
  });
});

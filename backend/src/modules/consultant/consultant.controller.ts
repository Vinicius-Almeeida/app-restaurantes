import { Request, Response } from 'express';
import { ConsultantService } from './consultant.service';
import { asyncHandler } from '../../utils/asyncHandler';

const consultantService = new ConsultantService();

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dashboard = await consultantService.getDashboard(userId);

  res.status(200).json({
    message: 'Dashboard data retrieved successfully',
    data: dashboard,
  });
});

export const getMyRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const restaurants = await consultantService.getMyRestaurants(userId);

  res.status(200).json({
    message: 'Restaurants retrieved successfully',
    data: restaurants,
  });
});

export const getRestaurantDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const restaurant = await consultantService.getRestaurantDetails(userId, id);

  res.status(200).json({
    message: 'Restaurant details retrieved successfully',
    data: restaurant,
  });
});

export const getMyPerformance = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const performance = await consultantService.getMyPerformance(userId);

  res.status(200).json({
    message: 'Performance data retrieved successfully',
    data: performance,
  });
});

export const onboardRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await consultantService.onboardRestaurant(userId, req.body);

  res.status(201).json({
    message: 'Restaurante criado com sucesso',
    data: result,
  });
});

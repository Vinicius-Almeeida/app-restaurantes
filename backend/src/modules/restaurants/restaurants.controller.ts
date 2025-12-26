import { Request, Response } from 'express';
import { RestaurantsService } from './restaurants.service';
import { asyncHandler } from '../../utils/asyncHandler';
import type { CreateRestaurantInput, UpdateRestaurantInput } from './restaurants.schema';

const restaurantsService = new RestaurantsService();

export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: CreateRestaurantInput = req.body;

  const restaurant = await restaurantsService.create(userId, data);

  res.status(201).json({
    message: 'Restaurant created successfully',
    data: restaurant,
  });
});

export const getRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  // If user is restaurant owner, only show their restaurants
  // If admin, show all restaurants
  const ownerId = role === 'RESTAURANT_OWNER' ? userId : undefined;

  const restaurants = await restaurantsService.findAll(ownerId);

  res.status(200).json({
    message: 'Restaurants retrieved successfully',
    data: restaurants,
  });
});

export const getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const restaurant = await restaurantsService.findById(id);

  res.status(200).json({
    message: 'Restaurant retrieved successfully',
    data: restaurant,
  });
});

export const getRestaurantBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const restaurant = await restaurantsService.findBySlug(slug);

  res.status(200).json({
    message: 'Restaurant retrieved successfully',
    data: restaurant,
  });
});

export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: UpdateRestaurantInput = req.body;

  const restaurant = await restaurantsService.update(id, userId, data);

  res.status(200).json({
    message: 'Restaurant updated successfully',
    data: restaurant,
  });
});

export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await restaurantsService.delete(id, userId);

  res.status(200).json(result);
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const restaurant = await restaurantsService.toggleActive(id, userId);

  res.status(200).json({
    message: 'Restaurant status updated successfully',
    data: restaurant,
  });
});

export const toggleAcceptsOrders = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const restaurant = await restaurantsService.toggleAcceptsOrders(id, userId);

  res.status(200).json({
    message: 'Restaurant order acceptance updated successfully',
    data: restaurant,
  });
});

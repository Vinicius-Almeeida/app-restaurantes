import { Request, Response } from 'express';
import { MenuService } from './menu.service';
import { asyncHandler } from '../../utils/asyncHandler';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from './menu.schema';

const menuService = new MenuService();

// ============================================
// MENU CATEGORIES
// ============================================

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: CreateCategoryInput = req.body;

  const category = await menuService.createCategory(userId, data);

  res.status(201).json({
    message: 'Category created successfully',
    data: category,
  });
});

export const getCategoriesByRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;

  const categories = await menuService.findCategoriesByRestaurant(restaurantId);

  res.status(200).json({
    message: 'Categories retrieved successfully',
    data: categories,
  });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await menuService.findCategoryById(id);

  res.status(200).json({
    message: 'Category retrieved successfully',
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: UpdateCategoryInput = req.body;

  const category = await menuService.updateCategory(id, userId, data);

  res.status(200).json({
    message: 'Category updated successfully',
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await menuService.deleteCategory(id, userId);

  res.status(200).json(result);
});

// ============================================
// MENU ITEMS
// ============================================

export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: CreateMenuItemInput = req.body;

  const menuItem = await menuService.createMenuItem(userId, data);

  res.status(201).json({
    message: 'Menu item created successfully',
    data: menuItem,
  });
});

export const getMenuItemsByRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const includeUnavailable = req.query.includeUnavailable === 'true';

  const menuItems = await menuService.findMenuItemsByRestaurant(restaurantId, includeUnavailable);

  res.status(200).json({
    message: 'Menu items retrieved successfully',
    data: menuItems,
  });
});

export const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const menuItem = await menuService.findMenuItemById(id);

  res.status(200).json({
    message: 'Menu item retrieved successfully',
    data: menuItem,
  });
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data: UpdateMenuItemInput = req.body;

  const menuItem = await menuService.updateMenuItem(id, userId, data);

  res.status(200).json({
    message: 'Menu item updated successfully',
    data: menuItem,
  });
});

export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await menuService.deleteMenuItem(id, userId);

  res.status(200).json(result);
});

export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const menuItem = await menuService.toggleAvailability(id, userId);

  res.status(200).json({
    message: 'Menu item availability updated successfully',
    data: menuItem,
  });
});

export const getFullMenu = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId } = req.params;

  const menu = await menuService.getFullMenu(restaurantId);

  res.status(200).json({
    message: 'Full menu retrieved successfully',
    data: menu,
  });
});

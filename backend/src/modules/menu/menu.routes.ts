import { Router } from 'express';
import * as menuController from './menu.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize, optionalAuth } from '../../middlewares/auth';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  getMenuItemSchema,
  getMenuByRestaurantSchema,
  getRecommendationsSchema,
  rateMenuItemSchema,
} from './menu.schema';

const router = Router();

// ============================================
// PUBLIC ROUTES - Menu viewing
// ============================================

// Get full menu for a restaurant (public)
router.get(
  '/restaurant/:restaurantId/full',
  validate(getMenuByRestaurantSchema),
  menuController.getFullMenu
);

// Get categories by restaurant (public)
router.get(
  '/restaurant/:restaurantId/categories',
  validate(getMenuByRestaurantSchema),
  menuController.getCategoriesByRestaurant
);

// Get menu items by restaurant (public)
router.get(
  '/restaurant/:restaurantId/items',
  validate(getMenuByRestaurantSchema),
  menuController.getMenuItemsByRestaurant
);

// Get single category (public)
router.get('/categories/:id', validate(getCategorySchema), menuController.getCategoryById);

// Get single menu item (public)
router.get('/items/:id', validate(getMenuItemSchema), menuController.getMenuItemById);

// ============================================
// RECOMMENDATIONS ROUTES (public, optionally authenticated)
// ============================================

// Get recommendations (mixed types)
router.get(
  '/restaurant/:restaurantId/recommendations',
  optionalAuth,
  validate(getRecommendationsSchema),
  menuController.getRecommendations
);

// Get popular items
router.get(
  '/restaurant/:restaurantId/popular',
  validate(getMenuByRestaurantSchema),
  menuController.getPopularItems
);

// Get trending items
router.get(
  '/restaurant/:restaurantId/trending',
  validate(getMenuByRestaurantSchema),
  menuController.getTrendingItems
);

// Get featured items (chef's choice)
router.get(
  '/restaurant/:restaurantId/featured',
  validate(getMenuByRestaurantSchema),
  menuController.getFeaturedItems
);

// Get new items
router.get(
  '/restaurant/:restaurantId/new',
  validate(getMenuByRestaurantSchema),
  menuController.getNewItems
);

// Rate a menu item (authenticated)
router.post(
  '/items/:id/rate',
  authenticate,
  validate(rateMenuItemSchema),
  menuController.rateMenuItem
);

// ============================================
// PROTECTED ROUTES - Restaurant owners only
// ============================================

// Categories
router.post(
  '/categories',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(createCategorySchema),
  menuController.createCategory
);

router.put(
  '/categories/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(updateCategorySchema),
  menuController.updateCategory
);

router.delete(
  '/categories/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(getCategorySchema),
  menuController.deleteCategory
);

// Menu Items
router.post(
  '/items',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(createMenuItemSchema),
  menuController.createMenuItem
);

router.put(
  '/items/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(updateMenuItemSchema),
  menuController.updateMenuItem
);

router.delete(
  '/items/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(getMenuItemSchema),
  menuController.deleteMenuItem
);

router.patch(
  '/items/:id/toggle-availability',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(getMenuItemSchema),
  menuController.toggleAvailability
);

export default router;

import { Router } from 'express';
import * as restaurantsController from './restaurants.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  getRestaurantSchema,
  deleteRestaurantSchema,
  getRestaurantBySlugSchema,
} from './restaurants.schema';

const router = Router();

// Public routes
router.get('/slug/:slug', validate(getRestaurantBySlugSchema), restaurantsController.getRestaurantBySlug);

// Protected routes - All users can view restaurants
router.get('/', authenticate, restaurantsController.getRestaurants);
router.get('/:id', authenticate, validate(getRestaurantSchema), restaurantsController.getRestaurantById);

// Protected routes - Only restaurant owners can create/update/delete
router.post(
  '/',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(createRestaurantSchema),
  restaurantsController.createRestaurant
);

router.put(
  '/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(updateRestaurantSchema),
  restaurantsController.updateRestaurant
);

router.delete(
  '/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(deleteRestaurantSchema),
  restaurantsController.deleteRestaurant
);

router.patch(
  '/:id/toggle-active',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(getRestaurantSchema),
  restaurantsController.toggleActive
);

router.patch(
  '/:id/toggle-orders',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(getRestaurantSchema),
  restaurantsController.toggleAcceptsOrders
);

export default router;

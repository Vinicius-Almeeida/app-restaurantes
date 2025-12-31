/**
 * Kitchen Routes - API Endpoints for Kitchen Operations
 * FAANG-level routing with proper middleware
 */

import { Router } from 'express';
import { kitchenController } from './kitchen.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// All kitchen routes require authentication
router.use(authenticate);

// Only KITCHEN staff, RESTAURANT_OWNER, and SUPER_ADMIN can access
const authorizedRoles = authorize('KITCHEN', 'RESTAURANT_OWNER', 'SUPER_ADMIN');

/**
 * @route   GET /api/kitchen/:restaurantId/orders
 * @desc    Get all active orders for Kanban board
 * @access  Kitchen Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/orders',
  authorizedRoles,
  kitchenController.getActiveOrders.bind(kitchenController)
);

/**
 * @route   GET /api/kitchen/:restaurantId/orders/list
 * @desc    Get orders with pagination and status filter
 * @access  Kitchen Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/orders/list',
  authorizedRoles,
  kitchenController.getOrdersByStatus.bind(kitchenController)
);

/**
 * @route   GET /api/kitchen/:restaurantId/stats
 * @desc    Get kitchen statistics
 * @access  Kitchen Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/stats',
  authorizedRoles,
  kitchenController.getStats.bind(kitchenController)
);

/**
 * @route   GET /api/kitchen/:restaurantId/orders/:orderId
 * @desc    Get single order details
 * @access  Kitchen Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/orders/:orderId',
  authorizedRoles,
  kitchenController.getOrderById.bind(kitchenController)
);

/**
 * @route   POST /api/kitchen/:restaurantId/orders/:orderId/confirm
 * @desc    Confirm order (PENDING -> CONFIRMED)
 * @access  Kitchen Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/orders/:orderId/confirm',
  authorizedRoles,
  kitchenController.confirmOrder.bind(kitchenController)
);

/**
 * @route   POST /api/kitchen/:restaurantId/orders/:orderId/start
 * @desc    Start preparing order (CONFIRMED -> PREPARING)
 * @access  Kitchen Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/orders/:orderId/start',
  authorizedRoles,
  kitchenController.startOrder.bind(kitchenController)
);

/**
 * @route   POST /api/kitchen/:restaurantId/orders/:orderId/ready
 * @desc    Mark order as ready (PREPARING -> READY)
 * @access  Kitchen Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/orders/:orderId/ready',
  authorizedRoles,
  kitchenController.markOrderReady.bind(kitchenController)
);

/**
 * @route   POST /api/kitchen/:restaurantId/orders/:orderId/cancel
 * @desc    Cancel order
 * @access  Kitchen Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/orders/:orderId/cancel',
  authorizedRoles,
  kitchenController.cancelOrder.bind(kitchenController)
);

export default router;

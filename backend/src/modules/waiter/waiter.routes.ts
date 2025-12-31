/**
 * Waiter Routes - API Endpoints for Waiter Operations
 * FAANG-level routing with proper middleware
 */

import { Router } from 'express';
import { waiterController } from './waiter.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// All waiter routes require authentication
router.use(authenticate);

// Waiter staff, managers, and owners can access
const staffRoles = authorize('WAITER', 'RESTAURANT_OWNER', 'SUPER_ADMIN');

// Customers can call waiter
const customerRoles = authorize('CUSTOMER', 'WAITER', 'RESTAURANT_OWNER', 'SUPER_ADMIN');

/**
 * @route   GET /api/waiter/:restaurantId/dashboard
 * @desc    Get full waiter dashboard data
 * @access  Waiter Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/dashboard',
  staffRoles,
  waiterController.getDashboard.bind(waiterController)
);

/**
 * @route   GET /api/waiter/:restaurantId/tables
 * @desc    Get all tables with session info
 * @access  Waiter Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/tables',
  staffRoles,
  waiterController.getTables.bind(waiterController)
);

/**
 * @route   GET /api/waiter/:restaurantId/ready-orders
 * @desc    Get all ready orders awaiting delivery
 * @access  Waiter Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/ready-orders',
  staffRoles,
  waiterController.getReadyOrders.bind(waiterController)
);

/**
 * @route   POST /api/waiter/:restaurantId/orders/:orderId/deliver
 * @desc    Mark order as delivered
 * @access  Waiter Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/orders/:orderId/deliver',
  staffRoles,
  waiterController.deliverOrder.bind(waiterController)
);

/**
 * @route   GET /api/waiter/:restaurantId/calls
 * @desc    Get waiter calls with filters
 * @access  Waiter Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/calls',
  staffRoles,
  waiterController.getCalls.bind(waiterController)
);

/**
 * @route   POST /api/waiter/:restaurantId/calls
 * @desc    Create a new waiter call (customer calling waiter)
 * @access  Customer, Waiter Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/calls',
  customerRoles,
  waiterController.createCall.bind(waiterController)
);

/**
 * @route   POST /api/waiter/:restaurantId/calls/:callId/acknowledge
 * @desc    Acknowledge a waiter call
 * @access  Waiter Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/calls/:callId/acknowledge',
  staffRoles,
  waiterController.acknowledgeCall.bind(waiterController)
);

/**
 * @route   POST /api/waiter/:restaurantId/calls/:callId/complete
 * @desc    Complete a waiter call
 * @access  Waiter Staff, Owner, Admin
 */
router.post(
  '/:restaurantId/calls/:callId/complete',
  staffRoles,
  waiterController.completeCall.bind(waiterController)
);

/**
 * @route   GET /api/waiter/:restaurantId/stats
 * @desc    Get waiter statistics
 * @access  Waiter Staff, Owner, Admin
 */
router.get(
  '/:restaurantId/stats',
  staffRoles,
  waiterController.getStats.bind(waiterController)
);

export default router;

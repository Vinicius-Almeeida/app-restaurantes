import { Router } from 'express';
import * as ordersController from './orders.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  createOrderSchema,
  addItemToOrderSchema,
  updateOrderStatusSchema,
  addParticipantSchema,
  getOrderSchema,
} from './orders.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create order (any authenticated user)
router.post('/', validate(createOrderSchema), ordersController.createOrder);

// Get all orders (filtered by role and user)
router.get('/', ordersController.getOrders);

// Get single order
router.get('/:id', validate(getOrderSchema), ordersController.getOrderById);

// Add item to order
router.post(
  '/:id/items',
  validate(addItemToOrderSchema),
  ordersController.addItemToOrder
);

// Update order status (restaurant owner or admin only)
router.patch(
  '/:id/status',
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(updateOrderStatusSchema),
  ordersController.updateOrderStatus
);

// Add participant to order
router.post(
  '/:id/participants',
  validate(addParticipantSchema),
  ordersController.addParticipant
);

export default router;

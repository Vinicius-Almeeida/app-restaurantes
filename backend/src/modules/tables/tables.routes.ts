import { Router } from 'express';
import { TablesController } from './tables.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import {
  createTableSchema,
  startSessionSchema,
  approveMemberSchema,
  closeSessionSchema,
} from './tables.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new TablesController();

// All routes require authentication
router.use(authenticate);

// Create table (restaurant owner only)
router.post(
  '/',
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  validate(createTableSchema),
  asyncHandler(controller.createTable.bind(controller))
);

// List tables of a restaurant
router.get(
  '/restaurant/:restaurantId',
  asyncHandler(controller.listTables.bind(controller))
);

// Start or join a table session (QR scan)
router.post(
  '/:tableId/session',
  validate(startSessionSchema),
  asyncHandler(controller.startSession.bind(controller))
);

// Get active session of a table
router.get(
  '/:tableId/session',
  asyncHandler(controller.getActiveSession.bind(controller))
);

// Approve or reject a member
router.patch(
  '/session/:sessionId/member/:memberId',
  validate(approveMemberSchema),
  asyncHandler(controller.approveMember.bind(controller))
);

// Generate exit QR code (after payment)
router.post(
  '/session/:sessionId/exit-qr',
  asyncHandler(controller.generateExitQr.bind(controller))
);

// Close session
router.patch(
  '/session/:sessionId/close',
  validate(closeSessionSchema),
  asyncHandler(controller.closeSession.bind(controller))
);

export default router;

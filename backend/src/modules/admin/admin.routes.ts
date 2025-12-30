import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, requireRole } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getDashboardMetricsSchema,
  listRestaurantsSchema,
  getRestaurantDetailsSchema,
  listUsersSchema,
  createPlanSchema,
  updatePlanSchema,
  listSubscriptionsSchema,
  updateSubscriptionSchema,
  createConsultantSchema,
  updateConsultantSchema,
  getConsultantSchema,
} from './admin.schema';

const router = Router();
const controller = new AdminController();

router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

// Dashboard
router.get('/dashboard', validate(getDashboardMetricsSchema), asyncHandler(controller.getDashboardMetrics.bind(controller)));

// Restaurants
router.get('/restaurants', validate(listRestaurantsSchema), asyncHandler(controller.listRestaurants.bind(controller)));
router.get('/restaurants/:id', validate(getRestaurantDetailsSchema), asyncHandler(controller.getRestaurantDetails.bind(controller)));

// Users
router.get('/users', validate(listUsersSchema), asyncHandler(controller.listUsers.bind(controller)));

// Plans
router.get('/plans', asyncHandler(controller.listPlans.bind(controller)));
router.post('/plans', validate(createPlanSchema), asyncHandler(controller.createPlan.bind(controller)));
router.patch('/plans/:id', validate(updatePlanSchema), asyncHandler(controller.updatePlan.bind(controller)));

// Subscriptions
router.get('/subscriptions', validate(listSubscriptionsSchema), asyncHandler(controller.listSubscriptions.bind(controller)));
router.patch('/subscriptions/:id', validate(updateSubscriptionSchema), asyncHandler(controller.updateSubscription.bind(controller)));

// Consultants
router.get('/consultants', asyncHandler(controller.listConsultants.bind(controller)));
router.post('/consultants', validate(createConsultantSchema), asyncHandler(controller.createConsultant.bind(controller)));
router.patch('/consultants/:id', validate(updateConsultantSchema), asyncHandler(controller.updateConsultant.bind(controller)));
router.get('/consultants/:id', validate(getConsultantSchema), asyncHandler(controller.getConsultantPerformance.bind(controller)));

// Escalated Complaints
router.get('/complaints/escalated', asyncHandler(controller.getEscalatedComplaints.bind(controller)));

export default router;

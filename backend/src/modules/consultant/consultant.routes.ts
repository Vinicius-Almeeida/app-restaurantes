import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/auth';
import * as controller from './consultant.controller';

const router = Router();

// All routes require authentication and CONSULTANT role
router.use(authenticate);
router.use(requireRole(['CONSULTANT']));

// Dashboard
router.get('/dashboard', controller.getDashboard);

// Restaurants
router.get('/restaurants', controller.getMyRestaurants);
router.get('/restaurants/:id', controller.getRestaurantDetails);
router.post('/onboard', controller.onboardRestaurant);

// Performance
router.get('/performance', controller.getMyPerformance);

export default router;

import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import * as schemas from './reviews.schema';

const router = Router();
const controller = new ReviewsController();

router.use(authenticate);

// Reviews
router.post('/reviews', validate(schemas.createReviewSchema), asyncHandler(controller.createReview.bind(controller)));
router.get('/reviews/restaurant/:restaurantId', validate(schemas.getRestaurantReviewsSchema), asyncHandler(controller.getRestaurantReviews.bind(controller)));
router.post('/reviews/:id/respond', validate(schemas.respondReviewSchema), asyncHandler(controller.respondToReview.bind(controller)));

// Suggestions
router.post('/suggestions', validate(schemas.createSuggestionSchema), asyncHandler(controller.createSuggestion.bind(controller)));
router.get('/suggestions/restaurant/:restaurantId', asyncHandler(controller.getSuggestions.bind(controller)));
router.post('/suggestions/:id/respond', validate(schemas.respondSuggestionSchema), asyncHandler(controller.respondToSuggestion.bind(controller)));

// Complaints
router.post('/complaints', validate(schemas.createComplaintSchema), asyncHandler(controller.createComplaint.bind(controller)));
router.get('/complaints/restaurant/:restaurantId', asyncHandler(controller.getComplaints.bind(controller)));
router.patch('/complaints/:id', validate(schemas.updateComplaintSchema), asyncHandler(controller.updateComplaint.bind(controller)));
router.post('/complaints/:id/escalate', asyncHandler(controller.escalateComplaint.bind(controller)));

// NPS
router.post('/nps', validate(schemas.createNpsSchema), asyncHandler(controller.createNpsResponse.bind(controller)));
router.get('/nps/restaurant/:restaurantId', asyncHandler(controller.getRestaurantNps.bind(controller)));

export default router;

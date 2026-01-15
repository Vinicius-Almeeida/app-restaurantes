/**
 * Customer Routes
 * Endpoints for customer-facing features (split preferences, insights)
 */

import { Router } from 'express';
import { SmartSplitController } from '../payments/smart-split.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/auth';
import { updatePreferencesSchema } from '../payments/smart-split.schema';

const router = Router();
const smartSplitController = new SmartSplitController();

// ============================================
// SPLIT PREFERENCES & INSIGHTS
// ============================================

// Get user's split preferences
router.get(
  '/split-preferences',
  authenticate,
  smartSplitController.getPreferences.bind(smartSplitController)
);

// Update user's split preferences
router.patch(
  '/split-preferences',
  authenticate,
  validate(updatePreferencesSchema),
  smartSplitController.updatePreferences.bind(smartSplitController)
);

// Get user's split insights (analytics dashboard)
router.get(
  '/split-insights',
  authenticate,
  smartSplitController.getInsights.bind(smartSplitController)
);

export default router;

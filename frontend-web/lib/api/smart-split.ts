/**
 * SmartSplit API Client
 * Handles communication with SmartSplit backend endpoints
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export type SplitMethod = 'EQUAL' | 'BY_ITEM' | 'CUSTOM' | 'PERCENTAGE';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';

export interface SplitRecommendation {
  method: SplitMethod;
  confidence: number;
  reason: string;
  alternativeMethods: Array<{
    method: SplitMethod;
    confidence: number;
    reason: string;
  }>;
}

export interface SplitPreferences {
  id: string;
  userId: string;
  preferredSplitMethod: SplitMethod;
  autoSuggestEnabled: boolean;
  learnFromHistory: boolean;
  preferredPaymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesInput {
  preferredSplitMethod?: SplitMethod;
  autoSuggestEnabled?: boolean;
  learnFromHistory?: boolean;
  preferredPaymentMethod?: PaymentMethod;
}

export interface SplitInsights {
  globalStats: {
    totalSplits: number;
    equalSplitCount: number;
    byItemSplitCount: number;
    customSplitCount: number;
    percentageSplitCount: number;
    avgParticipants: number;
    avgSplitAmount: number;
  } | null;
  topRestaurants: Array<{
    restaurantId: string;
    totalSplits: number;
    lastSplitMethod: SplitMethod | null;
  }>;
  recentDecisions: Array<{
    id: string;
    suggestedMethod: SplitMethod;
    chosenMethod: SplitMethod;
    suggestionAccepted: boolean;
    participantCount: number;
    totalAmount: number;
    createdAt: string;
  }>;
  groups: Array<{
    id: string;
    groupName: string | null;
    memberCount: number;
    splitCount: number;
    commonSplitMethod: SplitMethod;
  }>;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get split recommendation for an order
 */
export async function getSplitRecommendation(
  orderId: string,
  participantUserIds: string[]
): Promise<SplitRecommendation> {
  const response = await apiClient.post(`/payments/split/${orderId}/recommend`, {
    participantUserIds,
  });
  return response.data.data;
}

/**
 * Get user's split preferences
 */
export async function getSplitPreferences(): Promise<SplitPreferences> {
  const response = await apiClient.get('/customers/split-preferences');
  return response.data.data;
}

/**
 * Update user's split preferences
 */
export async function updateSplitPreferences(
  data: UpdatePreferencesInput
): Promise<SplitPreferences> {
  const response = await apiClient.patch('/customers/split-preferences', data);
  return response.data.data;
}

/**
 * Get user's split insights/analytics
 */
export async function getSplitInsights(): Promise<SplitInsights> {
  const response = await apiClient.get('/customers/split-insights');
  return response.data.data;
}

/**
 * Submit feedback for a split decision
 */
export async function submitSplitFeedback(
  decisionId: string,
  rating: number
): Promise<void> {
  await apiClient.post(`/payments/split/${decisionId}/feedback`, { rating });
}

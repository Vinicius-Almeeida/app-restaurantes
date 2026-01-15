/**
 * SmartSplit Service
 * Intelligent split bill recommendation engine
 * Learns from user behavior to suggest optimal split methods
 */

import prisma from '../../config/database';
import { SplitMethod, PaymentMethod } from '@prisma/client';
import { AppError } from '../../middlewares/errorHandler';

interface SplitRecommendation {
  method: SplitMethod;
  confidence: number; // 0-100
  reason: string;
  alternativeMethods: Array<{
    method: SplitMethod;
    confidence: number;
    reason: string;
  }>;
}

interface OrderContext {
  orderId: string;
  participantCount: number;
  totalAmount: number;
  hasSharedItems: boolean;
  itemVariance: number; // How different are individual item costs
}

interface UserSplitStats {
  totalSplits: number;
  methodFrequency: Record<SplitMethod, number>;
  preferredMethod: SplitMethod | null;
  avgParticipants: number;
}

export class SmartSplitService {
  /**
   * Get split recommendation for an order
   * Main entry point for SmartSplit AI
   */
  async getRecommendation(
    orderId: string,
    userId: string,
    participantUserIds: string[]
  ): Promise<SplitRecommendation> {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Build context
    const context = this.buildOrderContext(order);

    // Get user preferences and history
    const [userPreference, userStats, globalStats, groupPattern] = await Promise.all([
      this.getUserPreference(userId),
      this.getUserSplitStats(userId, order.restaurantId),
      this.getUserSplitStats(userId, null), // Global stats
      this.findMatchingGroupPattern(userId, participantUserIds),
    ]);

    // Calculate recommendation
    const recommendation = this.calculateRecommendation(
      context,
      userPreference,
      userStats,
      globalStats,
      groupPattern
    );

    return recommendation;
  }

  /**
   * Build context from order for ML decision
   */
  private buildOrderContext(order: {
    id: string;
    totalAmount: unknown;
    orderItems: Array<{
      userId: string | null;
      unitPrice: unknown;
      quantity: number;
      isShared: boolean;
    }>;
  }): OrderContext {
    const participantIds = new Set(
      order.orderItems
        .filter(item => item.userId)
        .map(item => item.userId as string)
    );

    const hasSharedItems = order.orderItems.some(item => item.isShared);

    // Calculate item cost variance (for BY_ITEM recommendation)
    const itemCosts = order.orderItems.map(
      item => Number(item.unitPrice) * item.quantity
    );
    const avgCost = itemCosts.reduce((a, b) => a + b, 0) / itemCosts.length;
    const variance = itemCosts.reduce(
      (sum, cost) => sum + Math.pow(cost - avgCost, 2),
      0
    ) / itemCosts.length;
    const itemVariance = Math.sqrt(variance) / avgCost; // Coefficient of variation

    return {
      orderId: order.id,
      participantCount: participantIds.size || 1,
      totalAmount: Number(order.totalAmount),
      hasSharedItems,
      itemVariance,
    };
  }

  /**
   * Get user split preference
   */
  private async getUserPreference(userId: string) {
    return prisma.userSplitPreference.findUnique({
      where: { userId },
    });
  }

  /**
   * Get user split statistics
   */
  private async getUserSplitStats(
    userId: string,
    restaurantId: string | null
  ): Promise<UserSplitStats> {
    const analytics = await prisma.customerSplitAnalytics.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId: restaurantId ?? '',
        },
      },
    });

    if (!analytics) {
      return {
        totalSplits: 0,
        methodFrequency: {
          EQUAL: 0,
          BY_ITEM: 0,
          CUSTOM: 0,
          PERCENTAGE: 0,
        },
        preferredMethod: null,
        avgParticipants: 0,
      };
    }

    const total = analytics.totalSplits || 1;
    const methodFrequency: Record<SplitMethod, number> = {
      EQUAL: (analytics.equalSplitCount / total) * 100,
      BY_ITEM: (analytics.byItemSplitCount / total) * 100,
      CUSTOM: (analytics.customSplitCount / total) * 100,
      PERCENTAGE: (analytics.percentageSplitCount / total) * 100,
    };

    // Find most used method
    let preferredMethod: SplitMethod | null = null;
    let maxFreq = 0;
    for (const [method, freq] of Object.entries(methodFrequency)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        preferredMethod = method as SplitMethod;
      }
    }

    return {
      totalSplits: analytics.totalSplits,
      methodFrequency,
      preferredMethod,
      avgParticipants: Number(analytics.avgParticipants),
    };
  }

  /**
   * Find matching group pattern for these participants
   */
  private async findMatchingGroupPattern(
    userId: string,
    participantUserIds: string[]
  ) {
    if (participantUserIds.length < 2) return null;

    // Find groups that contain all these participants
    const patterns = await prisma.splitGroupPattern.findMany({
      where: {
        creatorUserId: userId,
        memberCount: participantUserIds.length,
      },
      orderBy: {
        splitCount: 'desc',
      },
    });

    // Check for exact match or subset match
    for (const pattern of patterns) {
      const patternIds = pattern.memberUserIds;
      const isMatch = participantUserIds.every(id => patternIds.includes(id));
      if (isMatch) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Calculate final recommendation based on all factors
   */
  private calculateRecommendation(
    context: OrderContext,
    userPreference: { preferredSplitMethod: SplitMethod; autoSuggestEnabled: boolean } | null,
    userStats: UserSplitStats,
    globalStats: UserSplitStats,
    groupPattern: { commonSplitMethod: SplitMethod; splitCount: number } | null
  ): SplitRecommendation {
    const scores: Record<SplitMethod, { score: number; reasons: string[] }> = {
      EQUAL: { score: 0, reasons: [] },
      BY_ITEM: { score: 0, reasons: [] },
      CUSTOM: { score: 0, reasons: [] },
      PERCENTAGE: { score: 0, reasons: [] },
    };

    // Factor 1: User explicit preference (weight: 30%)
    if (userPreference?.autoSuggestEnabled !== false && userPreference?.preferredSplitMethod) {
      scores[userPreference.preferredSplitMethod].score += 30;
      scores[userPreference.preferredSplitMethod].reasons.push(
        'Método preferido nas configurações'
      );
    }

    // Factor 2: User history at this restaurant (weight: 25%)
    if (userStats.totalSplits > 0 && userStats.preferredMethod) {
      const historyWeight = Math.min(25, 5 + userStats.totalSplits * 2); // Max 25
      scores[userStats.preferredMethod].score += historyWeight;
      scores[userStats.preferredMethod].reasons.push(
        `Usado ${userStats.methodFrequency[userStats.preferredMethod].toFixed(0)}% das vezes neste restaurante`
      );
    }

    // Factor 3: Group pattern (weight: 20%)
    if (groupPattern && groupPattern.splitCount > 1) {
      scores[groupPattern.commonSplitMethod].score += 20;
      scores[groupPattern.commonSplitMethod].reasons.push(
        `Este grupo costuma usar este método (${groupPattern.splitCount}x)`
      );
    }

    // Factor 4: Order context analysis (weight: 25%)
    // High variance = BY_ITEM recommended (fairness)
    if (context.itemVariance > 0.5) {
      scores.BY_ITEM.score += 15;
      scores.BY_ITEM.reasons.push('Itens com preços muito diferentes');
    }

    // Shared items = EQUAL or CUSTOM recommended
    if (context.hasSharedItems) {
      scores.EQUAL.score += 10;
      scores.EQUAL.reasons.push('Pedido tem itens compartilhados');
      scores.CUSTOM.score += 5;
    }

    // Small group (2 people) = EQUAL is simple
    if (context.participantCount === 2) {
      scores.EQUAL.score += 10;
      scores.EQUAL.reasons.push('Ideal para 2 pessoas');
    }

    // Large group = BY_ITEM for fairness
    if (context.participantCount >= 4) {
      scores.BY_ITEM.score += 10;
      scores.BY_ITEM.reasons.push('Recomendado para grupos maiores');
    }

    // Factor 5: Global user behavior (weight: 10%)
    if (globalStats.totalSplits > 5 && globalStats.preferredMethod) {
      scores[globalStats.preferredMethod].score += 10;
      scores[globalStats.preferredMethod].reasons.push(
        'Baseado no seu histórico geral'
      );
    }

    // Default baseline for EQUAL (most common)
    scores.EQUAL.score += 5;
    scores.EQUAL.reasons.push('Método mais simples');

    // Find winner
    let bestMethod: SplitMethod = 'EQUAL';
    let bestScore = 0;
    const alternatives: SplitRecommendation['alternativeMethods'] = [];

    for (const [method, data] of Object.entries(scores)) {
      if (data.score > bestScore) {
        if (bestScore > 0) {
          alternatives.push({
            method: bestMethod,
            confidence: Math.min(99, bestScore),
            reason: scores[bestMethod].reasons[0] || 'Alternativa',
          });
        }
        bestScore = data.score;
        bestMethod = method as SplitMethod;
      } else if (data.score > 20) {
        alternatives.push({
          method: method as SplitMethod,
          confidence: Math.min(99, data.score),
          reason: data.reasons[0] || 'Alternativa',
        });
      }
    }

    // Normalize confidence (0-100)
    const maxPossibleScore = 100;
    const confidence = Math.min(99, Math.round((bestScore / maxPossibleScore) * 100));

    return {
      method: bestMethod,
      confidence,
      reason: scores[bestMethod].reasons.join('. ') || 'Método recomendado',
      alternativeMethods: alternatives.slice(0, 2),
    };
  }

  /**
   * Record split decision for learning
   */
  async recordDecision(
    userId: string,
    orderId: string,
    restaurantId: string,
    suggestedMethod: SplitMethod,
    chosenMethod: SplitMethod,
    confidence: number,
    participantCount: number,
    totalAmount: number,
    hasSharedItems: boolean,
    participantUserIds: string[]
  ): Promise<void> {
    const suggestionAccepted = suggestedMethod === chosenMethod;

    // Create decision history record
    await prisma.splitDecisionHistory.create({
      data: {
        userId,
        orderId,
        restaurantId,
        suggestedMethod,
        chosenMethod,
        suggestionConfidence: confidence,
        suggestionAccepted,
        participantCount,
        totalAmount,
        hasSharedItems,
      },
    });

    // Update analytics for user+restaurant
    await this.updateAnalytics(
      userId,
      restaurantId,
      chosenMethod,
      participantCount,
      totalAmount / participantCount
    );

    // Update global analytics
    await this.updateAnalytics(
      userId,
      null,
      chosenMethod,
      participantCount,
      totalAmount / participantCount
    );

    // Detect and update group patterns
    if (participantUserIds.length >= 2) {
      await this.updateGroupPattern(userId, participantUserIds, chosenMethod);
    }
  }

  /**
   * Update customer split analytics
   */
  private async updateAnalytics(
    userId: string,
    restaurantId: string | null,
    method: SplitMethod,
    participantCount: number,
    splitAmount: number
  ): Promise<void> {
    const methodField = this.getMethodCountField(method);

    // Upsert analytics record
    await prisma.customerSplitAnalytics.upsert({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId: restaurantId ?? '',
        },
      },
      create: {
        userId,
        restaurantId,
        totalSplits: 1,
        [methodField]: 1,
        lastSplitMethod: method,
        avgParticipants: participantCount,
        avgSplitAmount: splitAmount,
      },
      update: {
        totalSplits: { increment: 1 },
        [methodField]: { increment: 1 },
        lastSplitMethod: method,
        avgParticipants: participantCount, // Would need proper rolling average
        avgSplitAmount: splitAmount,
      },
    });
  }

  /**
   * Get prisma field name for method counter
   */
  private getMethodCountField(method: SplitMethod): string {
    switch (method) {
      case 'EQUAL': return 'equalSplitCount';
      case 'BY_ITEM': return 'byItemSplitCount';
      case 'CUSTOM': return 'customSplitCount';
      case 'PERCENTAGE': return 'percentageSplitCount';
    }
  }

  /**
   * Update or create group pattern
   */
  private async updateGroupPattern(
    userId: string,
    participantUserIds: string[],
    method: SplitMethod
  ): Promise<void> {
    const sortedIds = [...participantUserIds].sort();

    // Try to find existing pattern
    const existingPatterns = await prisma.splitGroupPattern.findMany({
      where: {
        creatorUserId: userId,
        memberCount: sortedIds.length,
      },
    });

    let matchedPattern = null;
    for (const pattern of existingPatterns) {
      const patternIds = [...pattern.memberUserIds].sort();
      if (JSON.stringify(patternIds) === JSON.stringify(sortedIds)) {
        matchedPattern = pattern;
        break;
      }
    }

    if (matchedPattern) {
      // Update existing pattern
      await prisma.splitGroupPattern.update({
        where: { id: matchedPattern.id },
        data: {
          splitCount: { increment: 1 },
          lastUsedAt: new Date(),
          commonSplitMethod: method, // Would need mode calculation for accuracy
        },
      });
    } else {
      // Create new pattern
      await prisma.splitGroupPattern.create({
        data: {
          creatorUserId: userId,
          memberUserIds: sortedIds,
          memberCount: sortedIds.length,
          splitCount: 1,
          lastUsedAt: new Date(),
          commonSplitMethod: method,
          isAutoDetected: true,
        },
      });
    }
  }

  /**
   * Get user's split preferences
   */
  async getPreferences(userId: string) {
    let preference = await prisma.userSplitPreference.findUnique({
      where: { userId },
    });

    // Create default if not exists
    if (!preference) {
      preference = await prisma.userSplitPreference.create({
        data: {
          userId,
          preferredSplitMethod: 'EQUAL',
          autoSuggestEnabled: true,
          learnFromHistory: true,
        },
      });
    }

    return preference;
  }

  /**
   * Update user's split preferences
   */
  async updatePreferences(
    userId: string,
    data: {
      preferredSplitMethod?: SplitMethod;
      autoSuggestEnabled?: boolean;
      learnFromHistory?: boolean;
      preferredPaymentMethod?: PaymentMethod;
    }
  ) {
    const updateData = {
      ...(data.preferredSplitMethod && { preferredSplitMethod: data.preferredSplitMethod }),
      ...(data.autoSuggestEnabled !== undefined && { autoSuggestEnabled: data.autoSuggestEnabled }),
      ...(data.learnFromHistory !== undefined && { learnFromHistory: data.learnFromHistory }),
      ...(data.preferredPaymentMethod && { preferredPaymentMethod: data.preferredPaymentMethod }),
    };

    return prisma.userSplitPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferredSplitMethod: data.preferredSplitMethod ?? 'EQUAL',
        autoSuggestEnabled: data.autoSuggestEnabled ?? true,
        learnFromHistory: data.learnFromHistory ?? true,
        preferredPaymentMethod: data.preferredPaymentMethod ?? null,
      },
      update: updateData,
    });
  }

  /**
   * Get user's split analytics/insights
   */
  async getInsights(userId: string) {
    const [globalStats, restaurantStats, recentDecisions, groups] = await Promise.all([
      prisma.customerSplitAnalytics.findUnique({
        where: {
          userId_restaurantId: { userId, restaurantId: '' },
        },
      }),
      prisma.customerSplitAnalytics.findMany({
        where: { userId, NOT: { restaurantId: '' } },
        take: 5,
        orderBy: { totalSplits: 'desc' },
      }),
      prisma.splitDecisionHistory.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.splitGroupPattern.findMany({
        where: { creatorUserId: userId },
        orderBy: { splitCount: 'desc' },
        take: 5,
      }),
    ]);

    return {
      global: globalStats,
      topRestaurants: restaurantStats,
      recentDecisions,
      frequentGroups: groups,
    };
  }

  /**
   * Submit feedback for a split decision
   */
  async submitFeedback(
    userId: string,
    decisionId: string,
    rating: number
  ): Promise<void> {
    const decision = await prisma.splitDecisionHistory.findFirst({
      where: { id: decisionId, userId },
    });

    if (!decision) {
      throw new AppError(404, 'Split decision not found');
    }

    await prisma.splitDecisionHistory.update({
      where: { id: decisionId },
      data: { userRating: rating },
    });
  }
}

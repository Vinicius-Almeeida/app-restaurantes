import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { Decimal } from '@prisma/client/runtime/library';

interface RecommendationOptions {
  restaurantId: string;
  limit?: number;
  userId?: string;
}

interface TrendingPeriod {
  days: number;
  weight: number;
}

export class MenuRecommendationsService {
  private readonly DEFAULT_LIMIT = 6;
  private readonly TRENDING_PERIODS: TrendingPeriod[] = [
    { days: 1, weight: 3 },   // Últimas 24h peso maior
    { days: 7, weight: 2 },   // Última semana
    { days: 30, weight: 1 },  // Último mês
  ];

  // ============================================
  // POPULAR ITEMS
  // Itens mais pedidos historicamente
  // ============================================
  async getPopularItems({ restaurantId, limit = this.DEFAULT_LIMIT }: RecommendationOptions) {
    await this.validateRestaurant(restaurantId);

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        orderCount: { gt: 0 },
      },
      orderBy: [
        { orderCount: 'desc' },
        { avgRating: 'desc' },
      ],
      take: limit,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return items.map(item => ({
      ...item,
      recommendationType: 'popular' as const,
      badge: this.getPopularityBadge(item.orderCount),
    }));
  }

  // ============================================
  // TRENDING ITEMS
  // Itens com crescimento recente de pedidos
  // ============================================
  async getTrendingItems({ restaurantId, limit = this.DEFAULT_LIMIT }: RecommendationOptions) {
    await this.validateRestaurant(restaurantId);

    // Busca pedidos recentes agrupados por item
    const recentOrderData = await prisma.$queryRaw<Array<{
      menu_item_id: string;
      recent_count: bigint;
      weekly_count: bigint;
      monthly_count: bigint;
    }>>`
      SELECT
        oi.menu_item_id,
        COUNT(CASE WHEN o.created_at > NOW() - INTERVAL '1 day' THEN 1 END) as recent_count,
        COUNT(CASE WHEN o.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as weekly_count,
        COUNT(CASE WHEN o.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as monthly_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE mi.restaurant_id = ${restaurantId}
        AND mi.is_available = true
        AND o.status != 'CANCELLED'
        AND o.created_at > NOW() - INTERVAL '30 days'
      GROUP BY oi.menu_item_id
      HAVING COUNT(*) >= 3
      ORDER BY
        (COUNT(CASE WHEN o.created_at > NOW() - INTERVAL '1 day' THEN 1 END) * 3 +
         COUNT(CASE WHEN o.created_at > NOW() - INTERVAL '7 days' THEN 1 END) * 2 +
         COUNT(*)) DESC
      LIMIT ${limit}
    `;

    if (recentOrderData.length === 0) {
      // Fallback para itens populares se não houver dados recentes
      return this.getPopularItems({ restaurantId, limit });
    }

    const itemIds = recentOrderData.map(d => d.menu_item_id);

    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        isAvailable: true,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    // Preservar ordem do trending score
    const itemMap = new Map(items.map(item => [item.id, item]));
    const orderedItems = itemIds
      .map(id => itemMap.get(id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return orderedItems.map((item, index) => ({
      ...item,
      recommendationType: 'trending' as const,
      badge: index < 3 ? 'Em alta' : 'Tendência',
      trendingScore: this.calculateTrendingScore(recentOrderData[index]),
    }));
  }

  // ============================================
  // FEATURED ITEMS
  // Destaques do chef / restaurante
  // ============================================
  async getFeaturedItems({ restaurantId, limit = this.DEFAULT_LIMIT }: RecommendationOptions) {
    await this.validateRestaurant(restaurantId);

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        isFeatured: true,
      },
      orderBy: [
        { avgRating: 'desc' },
        { orderCount: 'desc' },
      ],
      take: limit,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return items.map(item => ({
      ...item,
      recommendationType: 'featured' as const,
      badge: 'Destaque do Chef',
    }));
  }

  // ============================================
  // NEW ITEMS
  // Itens recém adicionados ao cardápio
  // ============================================
  async getNewItems({ restaurantId, limit = this.DEFAULT_LIMIT }: RecommendationOptions) {
    await this.validateRestaurant(restaurantId);

    // Considera "novo" os últimos 30 dias ou marcados como isNew
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        OR: [
          { isNew: true },
          { createdAt: { gte: thirtyDaysAgo } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return items.map(item => ({
      ...item,
      recommendationType: 'new' as const,
      badge: 'Novidade',
    }));
  }

  // ============================================
  // TOP RATED ITEMS
  // Itens com melhores avaliações
  // ============================================
  async getTopRatedItems({ restaurantId, limit = this.DEFAULT_LIMIT }: RecommendationOptions) {
    await this.validateRestaurant(restaurantId);

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        avgRating: { not: null },
        ratingCount: { gte: 3 }, // Mínimo de 3 avaliações
      },
      orderBy: [
        { avgRating: 'desc' },
        { ratingCount: 'desc' },
      ],
      take: limit,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return items.map(item => ({
      ...item,
      recommendationType: 'top_rated' as const,
      badge: this.getRatingBadge(item.avgRating),
    }));
  }

  // ============================================
  // PERSONALIZED RECOMMENDATIONS
  // Baseado no histórico do usuário
  // ============================================
  async getPersonalizedRecommendations({
    restaurantId,
    userId,
    limit = this.DEFAULT_LIMIT,
  }: RecommendationOptions) {
    await this.validateRestaurant(restaurantId);

    if (!userId) {
      // Sem userId, retorna populares
      return this.getPopularItems({ restaurantId, limit });
    }

    // Busca histórico de pedidos do usuário
    const userOrderHistory = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          status: { not: 'CANCELLED' },
        },
        userId,
      },
      select: {
        menuItemId: true,
        menuItem: {
          select: {
            categoryId: true,
            tags: true,
          },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    if (userOrderHistory.length === 0) {
      // Usuário novo, retorna populares
      return this.getPopularItems({ restaurantId, limit });
    }

    // Extrai categorias e tags favoritas
    const orderedItemIds = userOrderHistory.map(o => o.menuItemId);
    const favoriteCategories = this.getMostFrequent(
      userOrderHistory.map(o => o.menuItem.categoryId).filter(Boolean) as string[]
    );
    const favoriteTags = this.getMostFrequent(
      userOrderHistory.flatMap(o => o.menuItem.tags)
    );

    // Busca itens similares que o usuário ainda não pediu
    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        id: { notIn: orderedItemIds },
        OR: [
          { categoryId: { in: favoriteCategories.slice(0, 3) } },
          { tags: { hasSome: favoriteTags.slice(0, 5) } },
        ],
      },
      orderBy: [
        { avgRating: 'desc' },
        { orderCount: 'desc' },
      ],
      take: limit,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (items.length < limit) {
      // Complementa com populares se não tiver itens suficientes
      const popularItems = await this.getPopularItems({
        restaurantId,
        limit: limit - items.length,
      });
      const popularFiltered = popularItems.filter(
        p => !items.some(i => i.id === p.id) && !orderedItemIds.includes(p.id)
      );
      return [
        ...items.map(item => ({
          ...item,
          recommendationType: 'personalized' as const,
          badge: 'Para você',
        })),
        ...popularFiltered.slice(0, limit - items.length),
      ];
    }

    return items.map(item => ({
      ...item,
      recommendationType: 'personalized' as const,
      badge: 'Para você',
    }));
  }

  // ============================================
  // COMBINED RECOMMENDATIONS
  // Mix de diferentes tipos
  // ============================================
  async getRecommendations({
    restaurantId,
    userId,
    type,
    limit = this.DEFAULT_LIMIT,
  }: RecommendationOptions & { type?: string }) {
    switch (type) {
      case 'popular':
        return this.getPopularItems({ restaurantId, limit });
      case 'trending':
        return this.getTrendingItems({ restaurantId, limit });
      case 'featured':
        return this.getFeaturedItems({ restaurantId, limit });
      case 'new':
        return this.getNewItems({ restaurantId, limit });
      case 'personalized':
        return this.getPersonalizedRecommendations({ restaurantId, userId, limit });
      default:
        // Mix de tipos
        const [featured, popular, newItems] = await Promise.all([
          this.getFeaturedItems({ restaurantId, limit: 2 }),
          this.getPopularItems({ restaurantId, limit: 3 }),
          this.getNewItems({ restaurantId, limit: 2 }),
        ]);

        // Remove duplicatas
        const seenIds = new Set<string>();
        const combined = [...featured, ...popular, ...newItems].filter(item => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });

        return combined.slice(0, limit);
    }
  }

  // ============================================
  // RATE MENU ITEM
  // Atualiza rating do item
  // ============================================
  async rateMenuItem(itemId: string, userId: string, rating: number) {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError(404, 'Menu item not found');
    }

    // Calcula novo rating
    const currentRating = item.avgRating ? Number(item.avgRating) : 0;
    const currentCount = item.ratingCount;
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + rating) / newCount;

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        avgRating: new Decimal(newRating.toFixed(2)),
        ratingCount: newCount,
      },
    });

    return updatedItem;
  }

  // ============================================
  // INCREMENT ORDER COUNT
  // Incrementa contador de pedidos (chamado ao criar pedido)
  // ============================================
  async incrementOrderCount(itemIds: string[]) {
    await prisma.menuItem.updateMany({
      where: { id: { in: itemIds } },
      data: {
        orderCount: { increment: 1 },
      },
    });
  }

  // ============================================
  // HELPERS
  // ============================================
  private async validateRestaurant(restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }
  }

  private getPopularityBadge(orderCount: number): string {
    if (orderCount >= 100) return 'Best Seller';
    if (orderCount >= 50) return 'Muito Popular';
    if (orderCount >= 20) return 'Popular';
    return 'Favorito';
  }

  private getRatingBadge(rating: Decimal | null): string {
    if (!rating) return '';
    const num = Number(rating);
    if (num >= 4.8) return 'Excepcional';
    if (num >= 4.5) return 'Excelente';
    if (num >= 4.0) return 'Muito Bom';
    return 'Bem Avaliado';
  }

  private calculateTrendingScore(data: {
    recent_count: bigint;
    weekly_count: bigint;
    monthly_count: bigint;
  }): number {
    return (
      Number(data.recent_count) * 3 +
      Number(data.weekly_count) * 2 +
      Number(data.monthly_count)
    );
  }

  private getMostFrequent<T>(items: T[], maxItems = 5): T[] {
    const counts = new Map<T, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxItems)
      .map(([item]) => item);
  }
}

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  prepTime?: number;
  servingSize?: string;
  calories?: number;
  allergens: string[];
  isAvailable: boolean;
  stockQuantity?: number;
  orderCount: number;
  avgRating?: number;
  ratingCount: number;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  customizations?: Record<string, string[]>;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: MenuCategory;
  badge?: string;
  recommendationType?: 'popular' | 'trending' | 'featured' | 'new' | 'personalized' | 'top_rated';
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  menuItems?: MenuItem[];
  _count?: {
    menuItems: number;
  };
}

export interface FullMenu {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
  };
  categories: (MenuCategory & {
    menuItems: MenuItem[];
  })[];
}

export interface CreateMenuItemInput {
  restaurantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  prepTime?: number;
  servingSize?: string;
  calories?: number;
  allergens?: string[];
  stockQuantity?: number;
  customizations?: Record<string, string[]>;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  displayOrder?: number;
}

export interface UpdateMenuItemInput {
  categoryId?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  prepTime?: number;
  servingSize?: string;
  calories?: number;
  allergens?: string[];
  isAvailable?: boolean;
  stockQuantity?: number;
  customizations?: Record<string, string[]>;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  displayOrder?: number;
}

export type RecommendationType = 'popular' | 'trending' | 'featured' | 'new' | 'personalized';

// ============================================
// API FUNCTIONS
// ============================================

// Full Menu
export async function getFullMenu(restaurantId: string): Promise<FullMenu> {
  const response = await apiClient.get(`/menu/restaurant/${restaurantId}/full`);
  return response.data.data;
}

// Categories
export async function getCategoriesByRestaurant(restaurantId: string): Promise<MenuCategory[]> {
  const response = await apiClient.get(`/menu/restaurant/${restaurantId}/categories`);
  return response.data.data;
}

export async function getCategoryById(categoryId: string): Promise<MenuCategory> {
  const response = await apiClient.get(`/menu/categories/${categoryId}`);
  return response.data.data;
}

export async function createCategory(data: {
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}): Promise<MenuCategory> {
  const response = await apiClient.post('/menu/categories', data);
  return response.data.data;
}

export async function updateCategory(
  categoryId: string,
  data: Partial<{
    name: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  }>
): Promise<MenuCategory> {
  const response = await apiClient.put(`/menu/categories/${categoryId}`, data);
  return response.data.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/menu/categories/${categoryId}`);
}

// Menu Items
export async function getMenuItemsByRestaurant(
  restaurantId: string,
  includeUnavailable = false
): Promise<MenuItem[]> {
  const response = await apiClient.get(
    `/menu/restaurant/${restaurantId}/items?includeUnavailable=${includeUnavailable}`
  );
  return response.data.data;
}

export async function getMenuItemById(itemId: string): Promise<MenuItem> {
  const response = await apiClient.get(`/menu/items/${itemId}`);
  return response.data.data;
}

export async function createMenuItem(data: CreateMenuItemInput): Promise<MenuItem> {
  const response = await apiClient.post('/menu/items', data);
  return response.data.data;
}

export async function updateMenuItem(
  itemId: string,
  data: UpdateMenuItemInput
): Promise<MenuItem> {
  const response = await apiClient.put(`/menu/items/${itemId}`, data);
  return response.data.data;
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await apiClient.delete(`/menu/items/${itemId}`);
}

export async function toggleItemAvailability(itemId: string): Promise<MenuItem> {
  const response = await apiClient.patch(`/menu/items/${itemId}/toggle-availability`);
  return response.data.data;
}

// ============================================
// RECOMMENDATIONS
// ============================================

export async function getRecommendations(
  restaurantId: string,
  options?: {
    type?: RecommendationType;
    limit?: number;
  }
): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (options?.type) params.append('type', options.type);
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const url = `/menu/restaurant/${restaurantId}/recommendations${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get(url);
  return response.data.data;
}

export async function getPopularItems(
  restaurantId: string,
  limit?: number
): Promise<MenuItem[]> {
  const url = limit
    ? `/menu/restaurant/${restaurantId}/popular?limit=${limit}`
    : `/menu/restaurant/${restaurantId}/popular`;

  const response = await apiClient.get(url);
  return response.data.data;
}

export async function getTrendingItems(
  restaurantId: string,
  limit?: number
): Promise<MenuItem[]> {
  const url = limit
    ? `/menu/restaurant/${restaurantId}/trending?limit=${limit}`
    : `/menu/restaurant/${restaurantId}/trending`;

  const response = await apiClient.get(url);
  return response.data.data;
}

export async function getFeaturedItems(
  restaurantId: string,
  limit?: number
): Promise<MenuItem[]> {
  const url = limit
    ? `/menu/restaurant/${restaurantId}/featured?limit=${limit}`
    : `/menu/restaurant/${restaurantId}/featured`;

  const response = await apiClient.get(url);
  return response.data.data;
}

export async function getNewItems(
  restaurantId: string,
  limit?: number
): Promise<MenuItem[]> {
  const url = limit
    ? `/menu/restaurant/${restaurantId}/new?limit=${limit}`
    : `/menu/restaurant/${restaurantId}/new`;

  const response = await apiClient.get(url);
  return response.data.data;
}

export async function rateMenuItem(
  itemId: string,
  rating: number
): Promise<MenuItem> {
  const response = await apiClient.post(`/menu/items/${itemId}/rate`, { rating });
  return response.data.data;
}

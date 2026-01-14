/**
 * Consultant API Client
 * FAANG-level type-safe API calls for consultant operations
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export interface ConsultantDashboard {
  consultant: {
    id: string;
    commissionPercent: number;
    user: {
      fullName: string;
      email: string;
    };
  };
  stats: {
    totalRestaurants: number;
    activeRestaurants: number;
    totalRevenue: number;
    estimatedCommission: number;
  };
  recentRestaurants: ConsultantRestaurant[];
}

export interface ConsultantRestaurant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
  _count: {
    orders: number;
    menuItems: number;
    staff: number;
  };
  totalRevenue?: number;
}

export interface ConsultantRestaurantDetails extends ConsultantRestaurant {
  description: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  _count: {
    orders: number;
    menuItems: number;
    staff: number;
    reviews: number;
    tables: number;
  };
  totalRevenue: number;
  nps: number | null;
}

export interface ConsultantPerformance {
  consultant: {
    id: string;
    commissionPercent: number;
    createdAt: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  totalOnboarded: number;
  totalRevenue: number;
  totalCommission: number;
  monthlyStats: {
    month: string;
    restaurants: number;
    revenue: number;
    commission: number;
  }[];
}

export interface OnboardRestaurantInput {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
}

export interface OnboardRestaurantResult {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  owner: {
    id: string;
    fullName: string;
    email: string;
    isNew: boolean;
    tempPassword: string | null;
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get consultant dashboard data
 */
export async function getDashboard(): Promise<ConsultantDashboard> {
  const response = await apiClient.get('/consultant/dashboard');
  return response.data.data;
}

/**
 * Get consultant's onboarded restaurants
 */
export async function getMyRestaurants(): Promise<ConsultantRestaurant[]> {
  const response = await apiClient.get('/consultant/restaurants');
  return response.data.data;
}

/**
 * Get restaurant details (only if onboarded by this consultant)
 */
export async function getRestaurantDetails(id: string): Promise<ConsultantRestaurantDetails> {
  const response = await apiClient.get(`/consultant/restaurants/${id}`);
  return response.data.data;
}

/**
 * Get consultant's performance metrics
 */
export async function getMyPerformance(): Promise<ConsultantPerformance> {
  const response = await apiClient.get('/consultant/performance');
  return response.data.data;
}

/**
 * Onboard a new restaurant
 */
export async function onboardRestaurant(data: OnboardRestaurantInput): Promise<OnboardRestaurantResult> {
  const response = await apiClient.post('/consultant/onboard', data);
  return response.data.data;
}

export const consultantApi = {
  getDashboard,
  getMyRestaurants,
  getRestaurantDetails,
  getMyPerformance,
  onboardRestaurant,
};

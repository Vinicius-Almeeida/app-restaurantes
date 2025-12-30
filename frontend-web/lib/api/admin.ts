/**
 * Super Admin API Client
 * FAANG-level type-safe API calls for platform administration
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface AdminMetrics {
  mrr: number;
  arr: number;
  totalRestaurants: { isActive: boolean; _count: number }[];
  totalUsers: { role: string; _count: number }[];
  newRestaurants: number;
  churnedSubscriptions: number;
  gmv: number;
  period: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string[];
  maxTables: number;
  maxMenuItems: number;
  maxStaff: number;
  displayOrder: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  restaurantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  restaurant: { id: string; name: string };
  plan: Plan;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  owner: { id: string; fullName: string; email: string };
  subscription: { plan: Plan } | null;
  _count: { orders: number; menuItems: number; staff: number };
}

export interface RestaurantDetails extends Restaurant {
  owner: { id: string; fullName: string; email: string; phone: string | null };
  _count: { orders: number; menuItems: number; staff: number; reviews: number; tables: number };
  totalRevenue: number;
  nps: number | null;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface Consultant {
  id: string;
  userId: string;
  commissionPercent: number;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  _count: { onboardedRestaurants: number };
}

export interface EscalatedComplaint {
  id: string;
  restaurantId: string;
  userId: string;
  category: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  escalatedToSuper: boolean;
  createdAt: string;
  restaurant: { id: string; name: string };
  user: { id: string; fullName: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ListRestaurantsParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  planId?: string;
  search?: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface ListSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  planId?: string;
}

export interface CreatePlanInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  maxTables: number;
  maxMenuItems: number;
  maxStaff: number;
  displayOrder?: number;
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  maxTables?: number;
  maxMenuItems?: number;
  maxStaff?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  status?: SubscriptionStatus;
}

export interface CreateConsultantInput {
  userId: string;
  commissionPercent: number;
}

export interface UpdateConsultantInput {
  commissionPercent?: number;
  isActive?: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(period: string = '30d'): Promise<AdminMetrics> {
  const response = await apiClient.get('/admin/dashboard', { params: { period } });
  return response.data.data;
}

/**
 * List all restaurants with pagination and filters
 */
export async function listRestaurants(
  params?: ListRestaurantsParams
): Promise<{ restaurants: Restaurant[]; total: number; page: number; limit: number; pages: number }> {
  const response = await apiClient.get('/admin/restaurants', { params });
  return response.data.data;
}

/**
 * Get restaurant details
 */
export async function getRestaurantDetails(id: string): Promise<RestaurantDetails> {
  const response = await apiClient.get(`/admin/restaurants/${id}`);
  return response.data.data;
}

/**
 * List all users with pagination and filters
 */
export async function listUsers(
  params?: ListUsersParams
): Promise<{ users: User[]; total: number; page: number; limit: number; pages: number }> {
  const response = await apiClient.get('/admin/users', { params });
  return response.data.data;
}

/**
 * List all plans
 */
export async function listPlans(): Promise<Plan[]> {
  const response = await apiClient.get('/admin/plans');
  return response.data.data;
}

/**
 * Create a new plan
 */
export async function createPlan(data: CreatePlanInput): Promise<Plan> {
  const response = await apiClient.post('/admin/plans', data);
  return response.data.data;
}

/**
 * Update an existing plan
 */
export async function updatePlan(id: string, data: UpdatePlanInput): Promise<Plan> {
  const response = await apiClient.patch(`/admin/plans/${id}`, data);
  return response.data.data;
}

/**
 * List all subscriptions with pagination and filters
 */
export async function listSubscriptions(
  params?: ListSubscriptionsParams
): Promise<{ subscriptions: Subscription[]; total: number; page: number; limit: number; pages: number }> {
  const response = await apiClient.get('/admin/subscriptions', { params });
  return response.data.data;
}

/**
 * Update a subscription
 */
export async function updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<Subscription> {
  const response = await apiClient.patch(`/admin/subscriptions/${id}`, data);
  return response.data.data;
}

/**
 * List all consultants
 */
export async function listConsultants(): Promise<Consultant[]> {
  const response = await apiClient.get('/admin/consultants');
  return response.data.data;
}

/**
 * Create a new consultant
 */
export async function createConsultant(data: CreateConsultantInput): Promise<Consultant> {
  const response = await apiClient.post('/admin/consultants', data);
  return response.data.data;
}

/**
 * Update a consultant
 */
export async function updateConsultant(id: string, data: UpdateConsultantInput): Promise<Consultant> {
  const response = await apiClient.patch(`/admin/consultants/${id}`, data);
  return response.data.data;
}

/**
 * Get consultant performance details
 */
export async function getConsultantPerformance(id: string): Promise<Consultant & { onboardedRestaurants: unknown[] }> {
  const response = await apiClient.get(`/admin/consultants/${id}`);
  return response.data.data;
}

/**
 * Get escalated complaints
 */
export async function getEscalatedComplaints(): Promise<EscalatedComplaint[]> {
  const response = await apiClient.get('/admin/complaints/escalated');
  return response.data.data;
}

export const adminApi = {
  getDashboardMetrics,
  listRestaurants,
  getRestaurantDetails,
  listUsers,
  listPlans,
  createPlan,
  updatePlan,
  listSubscriptions,
  updateSubscription,
  listConsultants,
  createConsultant,
  updateConsultant,
  getConsultantPerformance,
  getEscalatedComplaints,
};

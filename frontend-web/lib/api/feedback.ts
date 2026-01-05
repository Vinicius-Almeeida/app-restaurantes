import { apiClient } from './client';
import type {
  Review,
  CreateReviewDto,
  ReviewResponseDto,
  ReviewStats,
  Suggestion,
  CreateSuggestionDto,
  SuggestionResponseDto,
  Complaint,
  CreateComplaintDto,
  ComplaintResponseDto,
  EscalateComplaintDto,
  NpsResponse,
  CreateNpsResponseDto,
  NpsScore,
  NpsTrend,
  SuggestionStatus,
  ComplaintStatus,
} from '@/lib/types/feedback';

// Reviews API
export const reviewsApi = {
  // Create a new review
  create: async (data: CreateReviewDto): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  // Get reviews by restaurant
  getByRestaurant: async (
    restaurantId: string,
    params?: {
      page?: number;
      limit?: number;
      minRating?: number;
      hasResponse?: boolean;
    }
  ): Promise<{ reviews: Review[]; total: number; stats: ReviewStats }> => {
    const response = await apiClient.get<{ reviews: Review[]; total: number; stats: ReviewStats }>(
      `/reviews/restaurant/${restaurantId}`,
      { params }
    );
    return response.data;
  },

  // Get review stats
  getStats: async (restaurantId: string): Promise<ReviewStats> => {
    const response = await apiClient.get<ReviewStats>(`/reviews/restaurant/${restaurantId}/stats`);
    return response.data;
  },

  // Get review by ID
  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  // Respond to a review (owner only)
  respond: async (id: string, data: ReviewResponseDto): Promise<Review> => {
    const response = await apiClient.post<Review>(`/reviews/${id}/response`, data);
    return response.data;
  },

  // Delete a review
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

// Suggestions API
export const suggestionsApi = {
  // Create a suggestion
  create: async (data: CreateSuggestionDto): Promise<Suggestion> => {
    const response = await apiClient.post<Suggestion>('/suggestions', data);
    return response.data;
  },

  // Get suggestions by restaurant
  getByRestaurant: async (
    restaurantId: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      status?: SuggestionStatus;
    }
  ): Promise<{ suggestions: Suggestion[]; total: number }> => {
    const response = await apiClient.get<{ suggestions: Suggestion[]; total: number }>(
      `/suggestions/restaurant/${restaurantId}`,
      { params }
    );
    return response.data;
  },

  // Get suggestion by ID
  getById: async (id: string): Promise<Suggestion> => {
    const response = await apiClient.get<Suggestion>(`/suggestions/${id}`);
    return response.data;
  },

  // Respond to a suggestion (owner only)
  respond: async (id: string, data: SuggestionResponseDto): Promise<Suggestion> => {
    const response = await apiClient.patch<Suggestion>(`/suggestions/${id}/response`, data);
    return response.data;
  },

  // Update suggestion status
  updateStatus: async (id: string, status: SuggestionStatus): Promise<Suggestion> => {
    const response = await apiClient.patch<Suggestion>(`/suggestions/${id}/status`, { status });
    return response.data;
  },

  // Delete a suggestion
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/suggestions/${id}`);
  },
};

// Complaints API
export const complaintsApi = {
  // Create a complaint
  create: async (data: CreateComplaintDto): Promise<Complaint> => {
    const response = await apiClient.post<Complaint>('/complaints', data);
    return response.data;
  },

  // Get complaints by restaurant
  getByRestaurant: async (
    restaurantId: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      priority?: string;
      status?: ComplaintStatus;
    }
  ): Promise<{ complaints: Complaint[]; total: number }> => {
    const response = await apiClient.get<{ complaints: Complaint[]; total: number }>(
      `/complaints/restaurant/${restaurantId}`,
      { params }
    );
    return response.data;
  },

  // Get complaint by ID
  getById: async (id: string): Promise<Complaint> => {
    const response = await apiClient.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  // Respond to a complaint
  respond: async (id: string, data: ComplaintResponseDto): Promise<Complaint> => {
    const response = await apiClient.patch<Complaint>(`/complaints/${id}/response`, data);
    return response.data;
  },

  // Update complaint status
  updateStatus: async (id: string, status: ComplaintStatus): Promise<Complaint> => {
    const response = await apiClient.patch<Complaint>(`/complaints/${id}/status`, { status });
    return response.data;
  },

  // Escalate to super admin
  escalate: async (id: string, data: EscalateComplaintDto): Promise<Complaint> => {
    const response = await apiClient.post<Complaint>(`/complaints/${id}/escalate`, data);
    return response.data;
  },

  // Delete a complaint
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/complaints/${id}`);
  },
};

// NPS API
export const npsApi = {
  // Submit NPS response
  create: async (data: CreateNpsResponseDto): Promise<NpsResponse> => {
    const response = await apiClient.post<NpsResponse>('/nps', data);
    return response.data;
  },

  // Get NPS responses by restaurant
  getByRestaurant: async (
    restaurantId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      segment?: string;
    }
  ): Promise<{ responses: NpsResponse[]; total: number }> => {
    const response = await apiClient.get<{ responses: NpsResponse[]; total: number }>(
      `/nps/restaurant/${restaurantId}`,
      { params }
    );
    return response.data;
  },

  // Get NPS score
  getScore: async (
    restaurantId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<NpsScore> => {
    const response = await apiClient.get<NpsScore>(
      `/nps/restaurant/${restaurantId}/score`,
      { params }
    );
    return response.data;
  },

  // Get NPS trend
  getTrend: async (
    restaurantId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      interval?: 'day' | 'week' | 'month';
    }
  ): Promise<NpsTrend[]> => {
    const response = await apiClient.get<NpsTrend[]>(
      `/nps/restaurant/${restaurantId}/trend`,
      { params }
    );
    return response.data;
  },
};

export default {
  reviews: reviewsApi,
  suggestions: suggestionsApi,
  complaints: complaintsApi,
  nps: npsApi,
};

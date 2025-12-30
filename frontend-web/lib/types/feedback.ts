// Review types
export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  restaurantId: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  waitTimeRating?: number;
  valueRating?: number;
  comment?: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  orderId: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  waitTimeRating?: number;
  valueRating?: number;
  comment?: string;
}

export interface ReviewResponseDto {
  response: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryAverages: {
    food: number;
    service: number;
    ambiance: number;
    waitTime: number;
    value: number;
  };
}

// Suggestion types
export type SuggestionCategory = 'MENU' | 'SERVICE' | 'AMBIANCE' | 'TECHNOLOGY' | 'OTHER';
export type SuggestionStatus = 'UNREAD' | 'READ' | 'RESPONDED' | 'IMPLEMENTED';

export interface Suggestion {
  id: string;
  restaurantId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  category: SuggestionCategory;
  content: string;
  isAnonymous: boolean;
  status: SuggestionStatus;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuggestionDto {
  restaurantId: string;
  category: SuggestionCategory;
  content: string;
  isAnonymous?: boolean;
}

export interface SuggestionResponseDto {
  response: string;
  status?: SuggestionStatus;
}

// Complaint types
export type ComplaintCategory =
  | 'FOOD_QUALITY'
  | 'SERVICE'
  | 'WAIT_TIME'
  | 'BILLING'
  | 'HYGIENE'
  | 'STAFF_BEHAVIOR'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'CLOSED';

export interface Complaint {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  subject: string;
  description: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  escalatedToSuper: boolean;
  escalatedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintDto {
  restaurantId: string;
  orderId?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  subject: string;
  description: string;
}

export interface ComplaintResponseDto {
  response: string;
  status?: ComplaintStatus;
}

export interface EscalateComplaintDto {
  reason: string;
}

// NPS types
export type NpsSegment = 'DETRACTOR' | 'PASSIVE' | 'PROMOTER';

export interface NpsResponse {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  score: number; // 0-10
  segment: NpsSegment;
  feedback?: string;
  createdAt: string;
}

export interface CreateNpsResponseDto {
  restaurantId: string;
  orderId?: string;
  score: number;
  feedback?: string;
}

export interface NpsScore {
  score: number; // -100 to 100
  promoters: number;
  promotersPercentage: number;
  passives: number;
  passivesPercentage: number;
  detractors: number;
  detractorsPercentage: number;
  totalResponses: number;
  period?: {
    startDate: string;
    endDate: string;
  };
}

export interface NpsTrend {
  date: string;
  score: number;
  responses: number;
}

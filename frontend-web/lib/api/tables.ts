/**
 * Tables API Client
 * FAANG-level type-safe API calls for table operations
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export interface PublicTable {
  id: string;
  number: number;
  capacity: number;
  qrCode: string;
  isOccupied: boolean;
  currentOccupancy: number;
}

export interface TableSession {
  id: string;
  status: string;
  members: TableSessionMember[];
  table: {
    id: string;
    number: number;
    capacity: number;
  };
}

export interface TableSessionMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'LEFT';
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface StartSessionResult {
  session: TableSession;
  member: TableSessionMember;
  isNew: boolean;
  isOwner?: boolean;
  needsApproval?: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get public tables for a restaurant (no auth required)
 * Shows only basic info: number, capacity, occupancy status
 */
export async function getPublicTables(restaurantId: string): Promise<PublicTable[]> {
  const response = await apiClient.get(`/tables/public/restaurant/${restaurantId}`);
  return response.data.data;
}

/**
 * Start or join a table session (requires auth)
 * First user becomes OWNER, others need approval
 */
export async function startSession(tableId: string): Promise<StartSessionResult> {
  const response = await apiClient.post(`/tables/${tableId}/session`, {});
  return response.data.data;
}

/**
 * Get active session of a table
 */
export async function getActiveSession(tableId: string): Promise<TableSession | null> {
  const response = await apiClient.get(`/tables/${tableId}/session`);
  return response.data.data;
}

/**
 * Approve or reject a member (table owner only)
 */
export async function approveMember(
  sessionId: string,
  memberId: string,
  approved: boolean
): Promise<TableSessionMember> {
  const response = await apiClient.patch(`/tables/session/${sessionId}/member/${memberId}`, {
    approved,
  });
  return response.data.data;
}

/**
 * Generate exit QR code (after payment)
 */
export async function generateExitQr(sessionId: string): Promise<{ exitQrCode: string }> {
  const response = await apiClient.post(`/tables/session/${sessionId}/exit-qr`);
  return response.data.data;
}

/**
 * Close table session
 */
export async function closeSession(sessionId: string): Promise<TableSession> {
  const response = await apiClient.patch(`/tables/session/${sessionId}/close`, {});
  return response.data.data;
}

export const tablesApi = {
  getPublicTables,
  startSession,
  getActiveSession,
  approveMember,
  generateExitQr,
  closeSession,
};

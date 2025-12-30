// Table session types
export type TableSessionStatus = 'ACTIVE' | 'CLOSED';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TableSessionMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: MemberStatus;
  isOwner: boolean;
  joinedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface TableSession {
  id: string;
  restaurantId: string;
  tableNumber: number;
  ownerId: string;
  ownerName: string;
  status: TableSessionStatus;
  members: TableSessionMember[];
  createdAt: string;
  closedAt?: string;
}

export interface CreateTableSessionPayload {
  restaurantId: string;
  tableNumber: number;
}

export interface JoinTableSessionPayload {
  restaurantId: string;
  tableNumber: number;
}

export interface ApproveMemberPayload {
  approved: boolean;
}

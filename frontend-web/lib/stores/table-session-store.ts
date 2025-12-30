/**
 * Table Session Store
 * Zustand store for table session state management with Socket.IO integration
 */

import { create } from 'zustand';
import type { TableSession, TableSessionMember } from '../types';

interface TableSessionState {
  session: TableSession | null;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: TableSession | null) => void;
  setIsOwner: (isOwner: boolean) => void;
  addMember: (member: TableSessionMember) => void;
  updateMember: (memberId: string, updates: Partial<TableSessionMember>) => void;
  removeMember: (memberId: string) => void;
  closeSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  isOwner: false,
  isLoading: false,
  error: null,
};

export const useTableSessionStore = create<TableSessionState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session, error: null }),

  setIsOwner: (isOwner) => set({ isOwner }),

  addMember: (member) =>
    set((state) => {
      if (!state.session) return state;

      return {
        session: {
          ...state.session,
          members: [...state.session.members, member],
        },
      };
    }),

  updateMember: (memberId, updates) =>
    set((state) => {
      if (!state.session) return state;

      return {
        session: {
          ...state.session,
          members: state.session.members.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m
          ),
        },
      };
    }),

  removeMember: (memberId) =>
    set((state) => {
      if (!state.session) return state;

      return {
        session: {
          ...state.session,
          members: state.session.members.filter((m) => m.id !== memberId),
        },
      };
    }),

  closeSession: () =>
    set((state) => {
      if (!state.session) return state;

      return {
        session: {
          ...state.session,
          status: 'CLOSED',
          closedAt: new Date().toISOString(),
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

/**
 * Payment Store
 * Zustand store for payment and split bill state management
 */

import { create } from 'zustand';
import type { SplitPayment, SplitMethod } from '../types';

interface PaymentState {
  splits: SplitPayment[];
  currentSplit: SplitPayment | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  allPaid: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSplits: (splits: SplitPayment[]) => void;
  setCurrentSplit: (split: SplitPayment | null) => void;
  addSplit: (split: SplitPayment) => void;
  updateSplit: (splitId: string, updates: Partial<SplitPayment>) => void;
  markSplitAsPaid: (splitId: string) => void;
  setTotalAmount: (amount: number) => void;
  calculateAmounts: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  splits: [],
  currentSplit: null,
  totalAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  allPaid: false,
  isLoading: false,
  error: null,
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  ...initialState,

  setSplits: (splits) => {
    set({ splits, error: null });
    get().calculateAmounts();
  },

  setCurrentSplit: (split) => set({ currentSplit: split }),

  addSplit: (split) => {
    set((state) => ({
      splits: [...state.splits, split],
    }));
    get().calculateAmounts();
  },

  updateSplit: (splitId, updates) => {
    set((state) => ({
      splits: state.splits.map((s) =>
        s.id === splitId ? { ...s, ...updates } : s
      ),
      currentSplit:
        state.currentSplit?.id === splitId
          ? { ...state.currentSplit, ...updates }
          : state.currentSplit,
    }));
    get().calculateAmounts();
  },

  markSplitAsPaid: (splitId) => {
    set((state) => ({
      splits: state.splits.map((s) =>
        s.id === splitId
          ? { ...s, paymentStatus: 'PAID', paidAt: new Date().toISOString() }
          : s
      ),
    }));
    get().calculateAmounts();
  },

  setTotalAmount: (amount) => {
    set({ totalAmount: amount });
    get().calculateAmounts();
  },

  calculateAmounts: () => {
    const { splits, totalAmount } = get();

    const paidAmount = splits
      .filter((s) => s.paymentStatus === 'PAID')
      .reduce((sum, s) => sum + s.amountDue, 0);

    const remainingAmount = totalAmount - paidAmount;
    const allPaid = remainingAmount <= 0 && totalAmount > 0;

    set({
      paidAmount,
      remainingAmount,
      allPaid,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

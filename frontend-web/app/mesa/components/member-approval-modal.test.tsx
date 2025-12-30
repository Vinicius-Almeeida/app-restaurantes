/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberApprovalModal } from './member-approval-modal';
import type { TableSessionMember } from '@/lib/types';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MemberApprovalModal', () => {
  const mockOnClose = jest.fn();
  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  const pendingMember: TableSessionMember = {
    id: 'member-1',
    userId: 'user-1',
    userName: 'João Silva',
    userEmail: 'joao@example.com',
    status: 'PENDING',
    isOwner: false,
    joinedAt: new Date().toISOString(),
  };

  const approvedMember: TableSessionMember = {
    id: 'member-2',
    userId: 'user-2',
    userName: 'Maria Santos',
    userEmail: 'maria@example.com',
    status: 'APPROVED',
    isOwner: true,
    joinedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('Gerenciar Membros da Mesa')).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    render(
      <MemberApprovalModal
        isOpen={false}
        onClose={mockOnClose}
        pendingMembers={[]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.queryByText('Gerenciar Membros da Mesa')).not.toBeInTheDocument();
  });

  it('displays pending members correctly', () => {
    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[pendingMember]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Aguardando Aprovacao/i)).toBeInTheDocument();
  });

  it('displays approved members correctly', () => {
    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[]}
        approvedMembers={[approvedMember]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(screen.getByText('Responsavel')).toBeInTheDocument();
    expect(screen.getByText('Aprovado')).toBeInTheDocument();
  });

  it('shows empty state when no members', () => {
    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('Nenhum membro na mesa ainda')).toBeInTheDocument();
  });

  it('calls onApprove when approve button is clicked', async () => {
    const user = userEvent.setup();
    mockOnApprove.mockResolvedValue(undefined);

    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[pendingMember]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const approveButton = screen.getByRole('button', { name: /aprovar/i });
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('member-1');
    });
  });

  it('calls onReject when reject button is clicked', async () => {
    const user = userEvent.setup();
    mockOnReject.mockResolvedValue(undefined);

    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[pendingMember]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /rejeitar/i });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockOnReject).toHaveBeenCalledWith('member-1');
    });
  });

  it('disables buttons while processing', async () => {
    const user = userEvent.setup();
    let resolveApprove: () => void;
    const approvePromise = new Promise<void>((resolve) => {
      resolveApprove = resolve;
    });
    mockOnApprove.mockReturnValue(approvePromise);

    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[pendingMember]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const approveButton = screen.getByRole('button', { name: /aprovar/i });
    const rejectButton = screen.getByRole('button', { name: /rejeitar/i });

    await user.click(approveButton);

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();

    // Resolve promise
    resolveApprove!();
    await waitFor(() => {
      expect(approveButton).not.toBeDisabled();
      expect(rejectButton).not.toBeDisabled();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays member count correctly', () => {
    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[pendingMember]}
        approvedMembers={[approvedMember]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText(/Aguardando Aprovacao \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Membros Aprovados \(1\)/i)).toBeInTheDocument();
  });

  it('formats joined time correctly', () => {
    const specificTime = new Date('2024-01-15T14:30:00');
    const memberWithTime: TableSessionMember = {
      ...pendingMember,
      joinedAt: specificTime.toISOString(),
    };

    render(
      <MemberApprovalModal
        isOpen={true}
        onClose={mockOnClose}
        pendingMembers={[memberWithTime]}
        approvedMembers={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText(/Solicitou em/i)).toBeInTheDocument();
  });
});

/**
 * Table Session Socket Hook
 * Handles real-time table session events
 */

'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS, getRoomNames } from './types';
import type {
  MemberJoinRequestPayload,
  MemberApprovedPayload,
  MemberRejectedPayload,
  MemberLeftPayload,
  SessionClosedPayload,
} from './types';

interface UseTableSocketOptions {
  sessionId?: string;
  isOwner?: boolean;
  onMemberJoinRequest?: (payload: MemberJoinRequestPayload) => void;
  onMemberApproved?: (payload: MemberApprovedPayload) => void;
  onMemberRejected?: (payload: MemberRejectedPayload) => void;
  onMemberLeft?: (payload: MemberLeftPayload) => void;
  onSessionClosed?: (payload: SessionClosedPayload) => void;
  enableNotifications?: boolean;
}

export function useTableSocket(options: UseTableSocketOptions = {}) {
  const {
    sessionId,
    isOwner = false,
    onMemberJoinRequest,
    onMemberApproved,
    onMemberRejected,
    onMemberLeft,
    onSessionClosed,
    enableNotifications = true,
  } = options;

  const { socket, state, joinRoom, leaveRoom } = useSocket();
  const router = useRouter();

  // Join table session room on mount
  useEffect(() => {
    if (!socket || !state.connected || !sessionId) return;

    const room = getRoomNames.tableSession(sessionId);
    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [socket, state.connected, sessionId, joinRoom, leaveRoom]);

  // Listen to member join requests (owner only)
  useEffect(() => {
    if (!socket || !isOwner) return;

    const handleJoinRequest = (payload: MemberJoinRequestPayload) => {
      console.log('[TableSocket] Member join request:', payload);

      if (enableNotifications) {
        toast.info('Solicitação de entrada na mesa', {
          description: `${payload.member.userName} quer entrar na mesa`,
          duration: 10000,
          action: {
            label: 'Ver',
            onClick: () => {
              // Navigate to approval modal or page
            },
          },
        });
      }

      onMemberJoinRequest?.(payload);
    };

    socket.on(SOCKET_EVENTS.MEMBER_JOIN_REQUEST, handleJoinRequest);

    return () => {
      socket.off(SOCKET_EVENTS.MEMBER_JOIN_REQUEST, handleJoinRequest);
    };
  }, [socket, isOwner, onMemberJoinRequest, enableNotifications]);

  // Listen to member approved
  useEffect(() => {
    if (!socket) return;

    const handleMemberApproved = (payload: MemberApprovedPayload) => {
      console.log('[TableSocket] Member approved:', payload);

      if (enableNotifications) {
        toast.success('Membro aprovado', {
          description: `${payload.member.userName} entrou na mesa`,
          duration: 4000,
        });
      }

      onMemberApproved?.(payload);
    };

    socket.on(SOCKET_EVENTS.MEMBER_APPROVED, handleMemberApproved);

    return () => {
      socket.off(SOCKET_EVENTS.MEMBER_APPROVED, handleMemberApproved);
    };
  }, [socket, onMemberApproved, enableNotifications]);

  // Listen to member rejected
  useEffect(() => {
    if (!socket) return;

    const handleMemberRejected = (payload: MemberRejectedPayload) => {
      console.log('[TableSocket] Member rejected:', payload);

      if (enableNotifications) {
        toast.error('Entrada recusada', {
          description: payload.reason || 'Sua solicitação de entrada na mesa foi recusada',
          duration: 5000,
        });
      }

      onMemberRejected?.(payload);

      // Redirect to home if current user was rejected
      router.push('/');
    };

    socket.on(SOCKET_EVENTS.MEMBER_REJECTED, handleMemberRejected);

    return () => {
      socket.off(SOCKET_EVENTS.MEMBER_REJECTED, handleMemberRejected);
    };
  }, [socket, onMemberRejected, enableNotifications, router]);

  // Listen to member left
  useEffect(() => {
    if (!socket) return;

    const handleMemberLeft = (payload: MemberLeftPayload) => {
      console.log('[TableSocket] Member left:', payload);

      if (enableNotifications) {
        toast.info('Membro saiu da mesa', {
          description: `${payload.userName} saiu da mesa`,
          duration: 3000,
        });
      }

      onMemberLeft?.(payload);
    };

    socket.on(SOCKET_EVENTS.MEMBER_LEFT, handleMemberLeft);

    return () => {
      socket.off(SOCKET_EVENTS.MEMBER_LEFT, handleMemberLeft);
    };
  }, [socket, onMemberLeft, enableNotifications]);

  // Listen to session closed
  useEffect(() => {
    if (!socket) return;

    const handleSessionClosed = (payload: SessionClosedPayload) => {
      console.log('[TableSocket] Session closed:', payload);

      if (enableNotifications) {
        toast.warning('Sessão encerrada', {
          description: 'A sessão da mesa foi encerrada',
          duration: 5000,
        });
      }

      onSessionClosed?.(payload);

      // Redirect to home
      router.push('/');
    };

    socket.on(SOCKET_EVENTS.SESSION_CLOSED, handleSessionClosed);

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_CLOSED, handleSessionClosed);
    };
  }, [socket, onSessionClosed, enableNotifications, router]);

  /**
   * Approve or reject a member (owner only)
   */
  const handleMemberRequest = useCallback((
    memberId: string,
    approved: boolean
  ) => {
    if (!isOwner || !socket) return;

    socket.emit('handle-member-request', {
      sessionId,
      memberId,
      approved,
    });
  }, [socket, sessionId, isOwner]);

  /**
   * Leave the table session
   */
  const leaveSession = useCallback(() => {
    if (!socket || !sessionId) return;

    socket.emit('leave-session', { sessionId });
  }, [socket, sessionId]);

  /**
   * Close the session (owner only)
   */
  const closeSession = useCallback(() => {
    if (!isOwner || !socket || !sessionId) return;

    socket.emit('close-session', { sessionId });
  }, [socket, sessionId, isOwner]);

  /**
   * Call waiter
   */
  const callWaiter = useCallback((reason?: string) => {
    if (!socket || !sessionId) return;

    socket.emit('call-waiter', { sessionId, reason });

    if (enableNotifications) {
      toast.success('Garçom chamado', {
        description: 'O garçom foi notificado e virá em breve',
        duration: 3000,
      });
    }
  }, [socket, sessionId, enableNotifications]);

  return {
    connected: state.connected,
    reconnecting: state.reconnecting,
    handleMemberRequest,
    leaveSession,
    closeSession,
    callWaiter,
  };
}

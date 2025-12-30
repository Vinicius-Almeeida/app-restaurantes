'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Clock } from 'lucide-react';
import type { TableSessionMember } from '@/lib/types';

interface MemberApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingMembers: TableSessionMember[];
  approvedMembers: TableSessionMember[];
  onApprove: (memberId: string) => Promise<void>;
  onReject: (memberId: string) => Promise<void>;
}

export function MemberApprovalModal({
  isOpen,
  onClose,
  pendingMembers,
  approvedMembers,
  onApprove,
  onReject,
}: MemberApprovalModalProps) {
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);

  const handleApprove = async (memberId: string) => {
    setProcessingMemberId(memberId);
    try {
      await onApprove(memberId);
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleReject = async (memberId: string) => {
    setProcessingMemberId(memberId);
    try {
      await onReject(memberId);
    } finally {
      setProcessingMemberId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Membros da Mesa
          </DialogTitle>
          <DialogDescription>
            Aprove ou rejeite solicitacoes para entrar na mesa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pending Members */}
          {pendingMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Aguardando Aprovacao ({pendingMembers.length})
              </h3>
              <div className="space-y-2">
                {pendingMembers.map((member) => (
                  <Card key={member.id} className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{member.userName}</p>
                          <p className="text-sm text-gray-500">{member.userEmail}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Solicitou em {new Date(member.joinedAt).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(member.id)}
                            disabled={processingMemberId === member.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(member.id)}
                            disabled={processingMemberId === member.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Approved Members */}
          {approvedMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Membros Aprovados ({approvedMembers.length})
              </h3>
              <div className="space-y-2">
                {approvedMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{member.userName}</p>
                            {member.isOwner && (
                              <Badge variant="default" className="text-xs">
                                Responsavel
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{member.userEmail}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Aprovado
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pendingMembers.length === 0 && approvedMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum membro na mesa ainda</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

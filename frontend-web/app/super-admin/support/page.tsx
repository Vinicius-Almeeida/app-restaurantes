'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi, type EscalatedComplaint } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  RefreshCw,
  User,
  Mail,
  Calendar,
  Store,
  Tag,
} from 'lucide-react';

type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

const priorityOrder: Record<ComplaintPriority, number> = {
  CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4,
};

const priorityConfig: Record<ComplaintPriority, { label: string; className: string }> = {
  LOW: { label: 'Baixa', className: 'bg-blue-100 text-blue-800' },
  MEDIUM: { label: 'Media', className: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
  CRITICAL: { label: 'Critica', className: 'bg-red-100 text-red-800' },
};

const statusConfig: Record<ComplaintStatus, { label: string; className: string }> = {
  OPEN: { label: 'Aberto', className: 'bg-red-100 text-red-800' },
  IN_PROGRESS: { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
  RESOLVED: { label: 'Resolvido', className: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Fechado', className: 'bg-gray-100 text-gray-800' },
};

function SupportPageContent() {
  const [complaints, setComplaints] = useState<EscalatedComplaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<EscalatedComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getEscalatedComplaints();

      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const pA = priorityOrder[a.priority as ComplaintPriority] || 5;
        const pB = priorityOrder[b.priority as ComplaintPriority] || 5;
        if (pA !== pB) return pA - pB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setComplaints(sorted);
      setFilteredComplaints(sorted);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    let filtered = [...complaints];
    if (statusFilter !== 'all') filtered = filtered.filter((c) => c.status === statusFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter((c) => c.priority === priorityFilter);
    setFilteredComplaints(filtered);
  }, [statusFilter, priorityFilter, complaints]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suporte</h1>
          <p className="text-gray-600">Gerenciar reclamacoes escaladas</p>
        </div>
        <Button onClick={fetchComplaints} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="OPEN">Aberto</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
            <SelectItem value="RESOLVED">Resolvido</SelectItem>
            <SelectItem value="CLOSED">Fechado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            <SelectItem value="LOW">Baixa</SelectItem>
            <SelectItem value="MEDIUM">Media</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="CRITICAL">Critica</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Empty State */}
      {filteredComplaints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma reclamacao encontrada</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Tente ajustar os filtros.'
                : 'Nao ha reclamacoes escaladas no momento.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredComplaints.map((complaint) => {
            const priority = priorityConfig[complaint.priority as ComplaintPriority];
            const status = statusConfig[complaint.status as ComplaintStatus];

            return (
              <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-gray-400" />
                    <CardTitle className="text-base truncate">
                      {complaint.restaurant?.name || 'Restaurante nao identificado'}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className={priority.className}>{priority.label}</Badge>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{complaint.category}</span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>

                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{complaint.user?.fullName || 'Usuario nao identificado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{complaint.user?.email || 'Email nao disponivel'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(complaint.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredComplaints.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Mostrando {filteredComplaints.length} de {complaints.length} reclamacoes
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <SupportPageContent />
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  adminApi,
  type Subscription,
  type Plan,
  type SubscriptionStatus,
  type UpdateSubscriptionInput,
} from '@/lib/api/admin';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  CreditCard,
  Store,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; className: string; icon: React.ReactNode }> = {
  ACTIVE: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  CANCELED: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
  },
  PAST_DUE: {
    label: 'Atrasado',
    className: 'bg-yellow-100 text-yellow-800',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  TRIALING: {
    label: 'Trial',
    className: 'bg-blue-100 text-blue-800',
    icon: <Clock className="h-4 w-4" />,
  },
};

function SubscriptionsPageContent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateSubscriptionInput>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter as SubscriptionStatus }),
        ...(planFilter !== 'all' && { planId: planFilter }),
      };

      const [subsData, plansData] = await Promise.all([
        adminApi.listSubscriptions(params),
        adminApi.listPlans(),
      ]);

      setSubscriptions(Array.isArray(subsData.subscriptions) ? subsData.subscriptions : []);
      setTotalPages(subsData.pages || 1);
      setTotalSubscriptions(subsData.total || 0);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, planFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const openEditDialog = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditFormData({
      planId: subscription.planId,
      status: subscription.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      setIsSubmitting(true);
      await adminApi.updateSubscription(editingSubscription.id, editFormData);
      toast.success('Assinatura atualizada com sucesso');
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao atualizar assinatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (filter: 'status' | 'plan', value: string) => {
    if (filter === 'status') {
      setStatusFilter(value);
    } else {
      setPlanFilter(value);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPlanFilter('all');
    setCurrentPage(1);
  };

  const getStatusCounts = () => {
    const counts = {
      active: subscriptions.filter((s) => s.status === 'ACTIVE').length,
      canceled: subscriptions.filter((s) => s.status === 'CANCELED').length,
      pastDue: subscriptions.filter((s) => s.status === 'PAST_DUE').length,
      trialing: subscriptions.filter((s) => s.status === 'TRIALING').length,
    };
    return counts;
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Carregando assinaturas...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assinaturas</h1>
          <p className="text-gray-600">Gerencie as assinaturas dos restaurantes</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold">{statusCounts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Trial</p>
                <p className="text-2xl font-bold">{statusCounts.trialing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold">{statusCounts.pastDue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold">{statusCounts.canceled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="TRIALING">Trial</SelectItem>
                <SelectItem value="PAST_DUE">Atrasado</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={(v) => handleFilterChange('plan', v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(statusFilter !== 'all' || planFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}

            <div className="ml-auto text-sm text-gray-600 self-center">
              Mostrando {subscriptions.length} de {totalSubscriptions} assinaturas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Lista de Assinaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura encontrada</h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' || planFilter !== 'all'
                  ? 'Tente ajustar os filtros.'
                  : 'Ainda nao ha assinaturas na plataforma.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Restaurante
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Plano
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Periodo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Dias Restantes
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => {
                      const statusConfig = STATUS_CONFIG[sub.status] || {
                        label: sub.status,
                        className: 'bg-gray-100 text-gray-800',
                        icon: null,
                      };
                      const daysRemaining = getDaysRemaining(sub.currentPeriodEnd);

                      return (
                        <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{sub.restaurant.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium">{sub.plan.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(sub.plan.price)}/
                                {sub.plan.billingPeriod === 'monthly' ? 'mes' : 'ano'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={statusConfig.className}>
                              <span className="flex items-center gap-1">
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(sub.currentPeriodStart)} -{' '}
                                {formatDate(sub.currentPeriodEnd)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant="outline"
                              className={
                                daysRemaining <= 7
                                  ? 'bg-red-50 text-red-700'
                                  : daysRemaining <= 30
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-green-50 text-green-700'
                              }
                            >
                              {daysRemaining > 0 ? `${daysRemaining} dias` : 'Expirado'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(sub)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Pagina {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Proxima <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Assinatura</DialogTitle>
          </DialogHeader>

          {editingSubscription && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Restaurante</p>
                <p className="font-semibold">{editingSubscription.restaurant.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plano</label>
                <Select
                  value={editFormData.planId}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, planId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.price)}/
                        {plan.billingPeriod === 'monthly' ? 'mes' : 'ano'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      status: value as SubscriptionStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="TRIALING">Trial</SelectItem>
                    <SelectItem value="PAST_DUE">Atrasado</SelectItem>
                    <SelectItem value="CANCELED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateSubscription} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <SubscriptionsPageContent />
    </ProtectedRoute>
  );
}

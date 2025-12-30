'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi, type Plan, type Subscription } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  CreditCard,
  Package,
  Check,
  Store,
  Calendar,
} from 'lucide-react';

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
  CANCELED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  PAST_DUE: { label: 'Atrasado', className: 'bg-yellow-100 text-yellow-800' },
  TRIALING: { label: 'Trial', className: 'bg-blue-100 text-blue-800' },
};

function BillingPageContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plansData, subsData] = await Promise.all([
        adminApi.listPlans(),
        adminApi.listSubscriptions({}),
      ]);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setSubscriptions(Array.isArray(subsData.subscriptions) ? subsData.subscriptions : []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">Gerencie planos e assinaturas</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans" className="gap-2">
            <Package className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Assinaturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={!plan.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal text-gray-500">
                      /{plan.billingPeriod === 'monthly' ? 'mes' : 'ano'}
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{plan.description}</p>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Limites:</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-bold">{plan.maxTables}</p>
                        <p className="text-xs text-gray-500">Mesas</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-bold">{plan.maxMenuItems}</p>
                        <p className="text-xs text-gray-500">Itens</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-bold">{plan.maxStaff}</p>
                        <p className="text-xs text-gray-500">Staff</p>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Features:</p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Assinaturas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">Nenhuma assinatura encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Restaurante</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Plano</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Periodo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => {
                        const statusBadge = STATUS_BADGES[sub.status] || { label: sub.status, className: 'bg-gray-100 text-gray-800' };
                        return (
                          <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-gray-400" />
                                {sub.restaurant.name}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium">{sub.plan.name}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={statusBadge.className}>
                                {statusBadge.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <BillingPageContent />
    </ProtectedRoute>
  );
}

'use client';

/**
 * Consultant Performance Page
 * FAANG-level enterprise page for consultants to track their performance metrics.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Store,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { consultantApi, type ConsultantPerformance } from '@/lib/api/consultant';

function PerformanceContent() {
  const [performance, setPerformance] = useState<ConsultantPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPerformance = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setIsRefreshing(true);
      }

      const data = await consultantApi.getMyPerformance();
      setPerformance(data);

      if (showToast) {
        toast.success('Dados atualizados');
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Erro ao carregar performance');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const handleRefresh = () => {
    fetchPerformance(true);
  };

  const formatCurrency = (value: number): string => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando performance...</p>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Erro ao carregar dados de performance</p>
          <Button onClick={handleRefresh} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minha Performance
          </h1>
          <p className="text-gray-600">
            Acompanhe seus resultados e comissoes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Consultant Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Consultor</p>
              <p className="text-xl font-bold text-gray-900">
                {performance.consultant.user.fullName}
              </p>
              <p className="text-sm text-gray-600">{performance.consultant.user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-700">Taxa de Comissao</p>
              <p className="text-2xl font-bold text-orange-600">
                {performance.consultant.commissionPercent}%
              </p>
              <p className="text-xs text-gray-500">
                Desde {formatDate(performance.consultant.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Restaurantes Onboarded
            </CardTitle>
            <Store className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {performance.totalOnboarded}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total de restaurantes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Gerada
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(performance.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total dos seus restaurantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comissao Total
            </CardTitle>
            <DollarSign className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(performance.totalCommission)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ganhos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Media por Restaurante
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {performance.totalOnboarded > 0
                ? formatCurrency(performance.totalRevenue / performance.totalOnboarded)
                : formatCurrency(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Receita media</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      {Array.isArray(performance.monthlyStats) && performance.monthlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historico Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Mes
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Restaurantes
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Receita
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Comissao
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performance.monthlyStats.map((stat) => (
                    <tr key={stat.month} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {stat.month}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {stat.restaurants}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatCurrency(stat.revenue)}
                      </td>
                      <td className="py-4 px-4 text-orange-600 font-medium">
                        {formatCurrency(stat.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute allowedRoles={['CONSULTANT']}>
      <PerformanceContent />
    </ProtectedRoute>
  );
}

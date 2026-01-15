'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingCart,
  BarChart3,
  Activity,
} from 'lucide-react';

interface AnalyticsData {
  mrr: number;
  arr: number;
  totalRestaurants: Array<{ isActive: boolean; _count: number }>;
  totalUsers: Array<{ role: string; _count: number }>;
  newRestaurants: number;
  churnedSubscriptions: number;
  gmv: number;
  period: string;
}

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await adminApi.getDashboardMetrics(period);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTotalRestaurants = () => {
    if (!data?.totalRestaurants) return { total: 0, active: 0, inactive: 0 };
    const active = data.totalRestaurants.find(r => r.isActive)?._count || 0;
    const inactive = data.totalRestaurants.find(r => !r.isActive)?._count || 0;
    return { total: active + inactive, active, inactive };
  };

  const getTotalUsers = () => {
    if (!data?.totalUsers) return { total: 0, byRole: {} as Record<string, number> };
    const total = data.totalUsers.reduce((sum, u) => sum + u._count, 0);
    const byRole = data.totalUsers.reduce((acc, u) => {
      acc[u.role] = u._count;
      return acc;
    }, {} as Record<string, number>);
    return { total, byRole };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-slate-400">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="w-full">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const restaurants = getTotalRestaurants();
  const users = getTotalUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Metricas e insights da plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">Ultimos 7 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="90d">Ultimos 90 dias</option>
            <option value="1y">Ultimo ano</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-500/10 rounded-lg mb-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm text-slate-400">MRR</p>
              <p className="text-xl font-bold text-white truncate w-full">{formatCurrency(data?.mrr || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-500/10 rounded-lg mb-3">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-sm text-slate-400">ARR</p>
              <p className="text-xl font-bold text-white truncate w-full">{formatCurrency(data?.arr || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-500/10 rounded-lg mb-3">
                <ShoppingCart className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-sm text-slate-400">GMV</p>
              <p className="text-xl font-bold text-white truncate w-full">{formatCurrency(data?.gmv || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-500/10 rounded-lg mb-3">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-sm text-slate-400">Churn</p>
              <p className="text-xl font-bold text-white">{data?.churnedSubscriptions || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-400" />
              Restaurantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total</span>
                <span className="text-2xl font-bold text-white">{restaurants.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ativos</span>
                <span className="text-lg font-semibold text-green-400">{restaurants.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Inativos</span>
                <span className="text-lg font-semibold text-red-400">{restaurants.inactive}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                <span className="text-slate-400">Novos no periodo</span>
                <span className="text-lg font-semibold text-blue-400">+{data?.newRestaurants || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Usuarios por Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total</span>
                <span className="text-2xl font-bold text-white">{users.total}</span>
              </div>
              {Object.entries(users.byRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{role}</span>
                  <span className="text-sm font-medium text-slate-300">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-400" />
            Atividade da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-600" />
              <p>Graficos detalhados em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

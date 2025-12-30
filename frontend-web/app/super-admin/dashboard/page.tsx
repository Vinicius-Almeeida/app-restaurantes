'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Store,
  Users,
  UserMinus,
  ShoppingCart,
  AlertTriangle,
  Headphones,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ProtectedRoute } from '@/components/auth';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SuperAdminSidebar } from '../components/sidebar';
import { MetricsCard } from '../components/metrics-card';
import {
  adminApi,
  type AdminMetrics as ApiAdminMetrics,
  type EscalatedComplaint as ApiEscalatedComplaint,
  type Restaurant,
  type Plan,
} from '@/lib/api/admin';

// Types for display
interface DisplayMetrics {
  mrr: number;
  arr: number;
  totalRestaurants: number;
  totalUsers: number;
  churnRate: number;
  gmv: number;
  newRestaurants: number;
}

interface RecentRestaurant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

interface EscalatedComplaint {
  id: string;
  restaurantName: string;
  issueType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

interface PlanDistribution {
  plan: string;
  count: number;
  percentage: number;
}

// Priority badge colors
const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

function SuperAdminDashboardContent() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [metrics, setMetrics] = useState<DisplayMetrics>({
    mrr: 0,
    arr: 0,
    totalRestaurants: 0,
    totalUsers: 0,
    churnRate: 0,
    gmv: 0,
    newRestaurants: 0,
  });
  const [recentRestaurants, setRecentRestaurants] = useState<RecentRestaurant[]>([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState<EscalatedComplaint[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }

      // Fetch all data in parallel from the real API
      const [metricsData, restaurantsData, complaintsData, plansData, subscriptionsData] = await Promise.all([
        adminApi.getDashboardMetrics('30d'),
        adminApi.listRestaurants({ page: 1, limit: 5 }),
        adminApi.getEscalatedComplaints(),
        adminApi.listPlans(),
        adminApi.listSubscriptions({ page: 1, limit: 1000 }),
      ]);

      // Transform metrics for display
      const totalRestaurants = Array.isArray(metricsData.totalRestaurants)
        ? metricsData.totalRestaurants.reduce((sum, item) => sum + item._count, 0)
        : 0;

      const totalUsers = Array.isArray(metricsData.totalUsers)
        ? metricsData.totalUsers.reduce((sum, item) => sum + item._count, 0)
        : 0;

      // Calculate churn rate
      const activeSubscriptions = subscriptionsData.subscriptions.filter(
        (s) => s.status === 'ACTIVE'
      ).length;
      const churnRate = activeSubscriptions > 0
        ? (metricsData.churnedSubscriptions / activeSubscriptions) * 100
        : 0;

      setMetrics({
        mrr: metricsData.mrr || 0,
        arr: metricsData.arr || 0,
        totalRestaurants,
        totalUsers,
        churnRate,
        gmv: Number(metricsData.gmv) || 0,
        newRestaurants: metricsData.newRestaurants || 0,
      });

      // Transform restaurants for display
      const transformedRestaurants: RecentRestaurant[] = restaurantsData.restaurants.map(
        (restaurant: Restaurant) => ({
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          ownerName: restaurant.owner.fullName,
          createdAt: restaurant.createdAt,
          status: restaurant.isActive ? 'ACTIVE' : 'INACTIVE',
        })
      );
      setRecentRestaurants(transformedRestaurants);

      // Transform complaints for display
      const transformedComplaints: EscalatedComplaint[] = complaintsData.slice(0, 5).map(
        (complaint: ApiEscalatedComplaint) => ({
          id: complaint.id,
          restaurantName: complaint.restaurant.name,
          issueType: complaint.category,
          priority: complaint.priority,
          createdAt: complaint.createdAt,
          status: complaint.status === 'CLOSED' ? 'RESOLVED' : complaint.status,
        })
      );
      setEscalatedComplaints(transformedComplaints);

      // Calculate plan distribution
      const planCounts: Record<string, number> = {};
      subscriptionsData.subscriptions.forEach((sub) => {
        const planName = sub.plan.name;
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      });

      const totalSubs = subscriptionsData.subscriptions.length || 1;
      const distribution: PlanDistribution[] = plansData
        .filter((plan: Plan) => plan.isActive)
        .map((plan: Plan) => ({
          plan: plan.name,
          count: planCounts[plan.name] || 0,
          percentage: ((planCounts[plan.name] || 0) / totalSubs) * 100,
        }));
      setPlanDistribution(distribution);

      if (showRefreshToast) {
        toast.success('Dashboard atualizado');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout();
    router.push('/super-admin/login');
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando Super Admin Dashboard..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SuperAdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard - Super Admin
            </h1>
            <p className="text-gray-600">
              Visão geral da plataforma TabSync
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            title="MRR (Receita Mensal Recorrente)"
            value={formatPrice(metrics.mrr)}
            icon={DollarSign}
            trend={{ value: 8.5, isPositive: true }}
          />
          <MetricsCard
            title="ARR (Receita Anual Recorrente)"
            value={formatPrice(metrics.arr)}
            icon={TrendingUp}
            trend={{ value: 12.3, isPositive: true }}
          />
          <MetricsCard
            title="GMV (Volume Transacionado)"
            value={formatPrice(metrics.gmv)}
            icon={ShoppingCart}
            description="Últimos 30 dias"
          />
          <MetricsCard
            title="Total de Restaurantes"
            value={metrics.totalRestaurants}
            icon={Store}
            description={`+${metrics.newRestaurants} novos`}
          />
          <MetricsCard
            title="Total de Usuários"
            value={metrics.totalUsers}
            icon={Users}
            trend={{ value: 7.8, isPositive: true }}
          />
          <MetricsCard
            title="Taxa de Churn"
            value={formatPercentage(metrics.churnRate)}
            icon={UserMinus}
            trend={{ value: metrics.churnRate, isPositive: metrics.churnRate < 5 }}
            className="border-orange-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Restaurants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Últimos Restaurantes Cadastrados</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/super-admin/restaurants">Ver Todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentRestaurants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Store className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum restaurante cadastrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/super-admin/restaurants/${restaurant.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-gray-900">
                            {restaurant.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className={statusColors[restaurant.status]}
                          >
                            {restaurant.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Proprietário: {restaurant.ownerName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(restaurant.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Escalated Complaints */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Reclamações Escaladas
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/super-admin/support">Ver Todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {escalatedComplaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Headphones className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma reclamação escalada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escalatedComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/super-admin/support/${complaint.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {complaint.restaurantName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {complaint.issueType}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={priorityColors[complaint.priority]}
                        >
                          {complaint.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            {planDistribution.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum plano configurado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {planDistribution.map((plan) => (
                  <div key={plan.plan} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{plan.plan}</span>
                      <span className="text-gray-600">
                        {plan.count} restaurantes ({formatPercentage(plan.percentage)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(plan.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <SuperAdminDashboardContent />
    </ProtectedRoute>
  );
}

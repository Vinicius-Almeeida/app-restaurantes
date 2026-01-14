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
  Award,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ProtectedRoute } from '@/components/auth';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MetricsCard } from '../components/metrics-card';
import {
  adminApi,
  type AdminMetrics as ApiAdminMetrics,
  type EscalatedComplaint as ApiEscalatedComplaint,
  type Restaurant,
  type Plan,
} from '@/lib/api/admin';
import { apiClient } from '@/lib/api/client';

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

interface ConsultantMetrics {
  totalRestaurants: number;
  activeRestaurants: number;
  totalRevenue: number;
  estimatedCommission: number;
  commissionPercent: number;
  totalOnboardings: number;
  totalEarnings: number;
}

interface ConsultantRestaurant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  onboardedAt: string;
  ordersCount: number;
  staffCount: number;
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

// ============= CONSULTANT DASHBOARD =============
function ConsultantDashboardContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [metrics, setMetrics] = useState<ConsultantMetrics | null>(null);
  const [restaurants, setRestaurants] = useState<ConsultantRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }

      const response = await apiClient.get<{
        data: {
          consultant: {
            id: string;
            name: string;
            email: string;
            commissionPercent: number;
            totalOnboardings: number;
            totalEarnings: number;
          };
          stats: {
            totalRestaurants: number;
            activeRestaurants: number;
            totalRevenue: number;
            estimatedCommission: number;
          };
          restaurants: ConsultantRestaurant[];
        };
      }>('/consultant/dashboard');

      const data = response.data.data;

      setMetrics({
        totalRestaurants: data.stats.totalRestaurants,
        activeRestaurants: data.stats.activeRestaurants,
        totalRevenue: Number(data.stats.totalRevenue) || 0,
        estimatedCommission: Number(data.stats.estimatedCommission) || 0,
        commissionPercent: data.consultant.commissionPercent,
        totalOnboardings: data.consultant.totalOnboardings,
        totalEarnings: Number(data.consultant.totalEarnings) || 0,
      });

      setRestaurants(data.restaurants || []);

      if (showRefreshToast) {
        toast.success('Dashboard atualizado');
      }
    } catch (error) {
      console.error('Error fetching consultant dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Bem-vindo, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400">
            Acompanhe seus restaurantes e comissoes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-500/10 rounded-lg mb-3">
                <Store className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-sm text-slate-400">Restaurantes</p>
              <p className="text-2xl font-bold text-white">{metrics?.totalRestaurants || 0}</p>
              <p className="text-xs text-green-400">{metrics?.activeRestaurants || 0} ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-500/10 rounded-lg mb-3">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm text-slate-400">Faturamento</p>
              <p className="text-xl font-bold text-white truncate w-full">{formatPrice(metrics?.totalRevenue || 0)}</p>
              <p className="text-xs text-slate-500">dos restaurantes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-orange-500/10 rounded-lg mb-3">
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-sm text-slate-400">Comissao</p>
              <p className="text-xl font-bold text-white truncate w-full">{formatPrice(metrics?.estimatedCommission || 0)}</p>
              <p className="text-xs text-slate-500">{metrics?.commissionPercent || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-500/10 rounded-lg mb-3">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-sm text-slate-400">Ganhos</p>
              <p className="text-xl font-bold text-white truncate w-full">{formatPrice(metrics?.totalEarnings || 0)}</p>
              <p className="text-xs text-slate-500">{metrics?.totalOnboardings || 0} onboardings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Meus Restaurantes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <Link href="/super-admin/restaurants">Ver Todos</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {restaurants.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Store className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p>Nenhum restaurante cadastrado ainda</p>
              <p className="text-sm mt-1">Seus restaurantes onboarded aparecerao aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.slice(0, 5).map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 cursor-pointer transition-colors"
                  onClick={() => router.push(`/super-admin/restaurants/${restaurant.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-white">{restaurant.name}</p>
                      <Badge
                        variant="secondary"
                        className={restaurant.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}
                      >
                        {restaurant.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {restaurant.ordersCount} pedidos | {restaurant.staffCount} funcionarios
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Onboarded em {formatDate(restaurant.onboardedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= ADMIN DASHBOARD =============
function AdminDashboardContent() {
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

      const [metricsData, restaurantsData, complaintsData, plansData, subscriptionsData] = await Promise.all([
        adminApi.getDashboardMetrics('30d'),
        adminApi.listRestaurants({ page: 1, limit: 5 }),
        adminApi.getEscalatedComplaints(),
        adminApi.listPlans(),
        adminApi.listSubscriptions({ page: 1, limit: 1000 }),
      ]);

      const totalRestaurants = Array.isArray(metricsData.totalRestaurants)
        ? metricsData.totalRestaurants.reduce((sum, item) => sum + item._count, 0)
        : 0;

      const totalUsers = Array.isArray(metricsData.totalUsers)
        ? metricsData.totalUsers.reduce((sum, item) => sum + item._count, 0)
        : 0;

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
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Dashboard - Super Admin
          </h1>
          <p className="text-slate-400">
            Visao geral da plataforma TabSync
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          description="Ultimos 30 dias"
        />
        <MetricsCard
          title="Total de Restaurantes"
          value={metrics.totalRestaurants}
          icon={Store}
          description={`+${metrics.newRestaurants} novos`}
        />
        <MetricsCard
          title="Total de Usuarios"
          value={metrics.totalUsers}
          icon={Users}
          trend={{ value: 7.8, isPositive: true }}
        />
        <MetricsCard
          title="Taxa de Churn"
          value={formatPercentage(metrics.churnRate)}
          icon={UserMinus}
          trend={{ value: metrics.churnRate, isPositive: metrics.churnRate < 5 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Restaurants */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Ultimos Restaurantes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Link href="/super-admin/restaurants">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRestaurants.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Store className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                <p>Nenhum restaurante cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 cursor-pointer transition-colors"
                    onClick={() => router.push(`/super-admin/restaurants/${restaurant.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white text-sm">{restaurant.name}</p>
                        <Badge
                          variant="secondary"
                          className={statusColors[restaurant.status]}
                        >
                          {restaurant.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {restaurant.ownerName} | {formatDate(restaurant.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Escalated Complaints */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Reclamacoes Escaladas
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Link href="/super-admin/support">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {escalatedComplaints.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Headphones className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                <p>Nenhuma reclamacao escalada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {escalatedComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 cursor-pointer transition-colors"
                    onClick={() => router.push(`/super-admin/support/${complaint.id}`)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-white text-sm">{complaint.restaurantName}</p>
                      <Badge variant="secondary" className={priorityColors[complaint.priority]}>
                        {complaint.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{complaint.issueType}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Distribuicao de Planos</CardTitle>
        </CardHeader>
        <CardContent>
          {planDistribution.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Nenhum plano configurado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{plan.plan}</span>
                    <span className="text-slate-400">
                      {plan.count} restaurantes ({formatPercentage(plan.percentage)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(plan.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= MAIN COMPONENT =============
function DashboardRouter() {
  const { user } = useAuthStore();

  if (user?.role === 'CONSULTANT') {
    return <ConsultantDashboardContent />;
  }

  return <AdminDashboardContent />;
}

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CONSULTANT']}>
      <DashboardRouter />
    </ProtectedRoute>
  );
}

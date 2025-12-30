'use client';

import { useEffect, useState } from 'react';
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

// Types
interface AdminMetrics {
  mrr: number;
  arr: number;
  totalRestaurants: number;
  totalUsers: number;
  churnRate: number;
  gmv: number;
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
  const [metrics, setMetrics] = useState<AdminMetrics>({
    mrr: 0,
    arr: 0,
    totalRestaurants: 0,
    totalUsers: 0,
    churnRate: 0,
    gmv: 0,
  });
  const [recentRestaurants, setRecentRestaurants] = useState<RecentRestaurant[]>([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState<EscalatedComplaint[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API endpoints when backend is ready
      // Mock data for demonstration

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock metrics
      setMetrics({
        mrr: 45230.50,
        arr: 542766.00,
        totalRestaurants: 127,
        totalUsers: 1543,
        churnRate: 2.3,
        gmv: 1250000.00,
      });

      // Mock recent restaurants
      setRecentRestaurants([
        {
          id: '1',
          name: 'Pizzaria Bella Napoli',
          slug: 'pizzaria-bella-napoli',
          ownerName: 'João Silva',
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
        },
        {
          id: '2',
          name: 'Sushi House Premium',
          slug: 'sushi-house-premium',
          ownerName: 'Maria Santos',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'ACTIVE',
        },
        {
          id: '3',
          name: 'Burger & Beer',
          slug: 'burger-beer',
          ownerName: 'Carlos Oliveira',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'INACTIVE',
        },
      ]);

      // Mock escalated complaints
      setEscalatedComplaints([
        {
          id: '1',
          restaurantName: 'Restaurante Dom Pedro',
          issueType: 'Pagamento não processado',
          priority: 'CRITICAL',
          createdAt: new Date().toISOString(),
          status: 'OPEN',
        },
        {
          id: '2',
          restaurantName: 'Cantina Italiana',
          issueType: 'Sistema lento',
          priority: 'MEDIUM',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'IN_PROGRESS',
        },
      ]);

      // Mock plan distribution
      setPlanDistribution([
        { plan: 'Básico', count: 45, percentage: 35.4 },
        { plan: 'Pro', count: 58, percentage: 45.7 },
        { plan: 'Enterprise', count: 24, percentage: 18.9 },
      ]);

      // Uncomment when API is ready:
      // const [metricsRes, restaurantsRes, complaintsRes, plansRes] = await Promise.all([
      //   apiClient.get<{ data: AdminMetrics }>('/super-admin/metrics'),
      //   apiClient.get<{ data: RecentRestaurant[] }>('/super-admin/restaurants/recent'),
      //   apiClient.get<{ data: EscalatedComplaint[] }>('/super-admin/support/escalated'),
      //   apiClient.get<{ data: PlanDistribution[] }>('/super-admin/plans/distribution'),
      // ]);
      //
      // setMetrics(metricsRes.data.data);
      // setRecentRestaurants(restaurantsRes.data.data);
      // setEscalatedComplaints(complaintsRes.data.data);
      // setPlanDistribution(plansRes.data.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard - Super Admin
          </h1>
          <p className="text-gray-600">
            Visão geral da plataforma TabSync
          </p>
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
            description="Último mês"
          />
          <MetricsCard
            title="Total de Restaurantes"
            value={metrics.totalRestaurants}
            icon={Store}
            trend={{ value: 5.2, isPositive: true }}
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
            trend={{ value: 0.5, isPositive: false }}
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
                      style={{ width: `${plan.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <SuperAdminDashboardContent />
    </ProtectedRoute>
  );
}

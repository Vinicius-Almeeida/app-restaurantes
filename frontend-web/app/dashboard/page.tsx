'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { ProtectedRoute } from '@/components/auth';
import { StatCard } from '@/components/dashboard';
import { OrderStatusBadge } from '@/components/order';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  averageTicket: number;
  pendingOrders: number;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string | number | null;
  status: string;
  totalAmount: string | number;
  subtotal: string | number;
  createdAt: string;
  restaurant?: {
    id: string;
    name: string;
  };
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    averageTicket: 0,
    pendingOrders: 0,
  });
  const [todayOrdersList, setTodayOrdersList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const ordersResponse = await apiClient.get<{ data: Order[] }>('/orders');
      const allOrders = Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : [];

      // Filter today's orders - use local timezone
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      const todayOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= todayStart;
      });

      // Calculate revenue only from completed/delivered orders (not cancelled)
      const completedTodayOrders = todayOrders.filter(
        (o) => o.status !== 'CANCELLED'
      );

      const todayRevenue = completedTodayOrders.reduce((sum, o) => {
        const amount = Number(o.totalAmount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const averageTicket = completedTodayOrders.length > 0
        ? todayRevenue / completedTodayOrders.length
        : 0;

      const pendingOrders = allOrders.filter(
        (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
      ).length;

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        averageTicket,
        pendingOrders,
      });

      // Show today's orders sorted by most recent
      setTodayOrdersList(todayOrders.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo de volta, {user?.fullName}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pedidos Hoje"
            value={stats.todayOrders}
            icon="📊"
            description={`${stats.pendingOrders} pendentes`}
          />
          <StatCard
            title="Faturamento Hoje"
            value={formatPrice(stats.todayRevenue)}
            icon="💰"
          />
          <StatCard
            title="Ticket Medio"
            value={formatPrice(stats.averageTicket)}
            icon="🎯"
          />
          <StatCard
            title="Pedidos Pendentes"
            value={stats.pendingOrders}
            icon="⏳"
            description="Aguardando atendimento"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pedidos de Hoje</CardTitle>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/orders">Ver Todos</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {todayOrdersList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>Nenhum pedido hoje ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayOrdersList.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/orders`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium">
                              #{order.orderNumber}
                              {order.tableNumber && ` - Mesa ${order.tableNumber}`}
                            </p>
                            <OrderStatusBadge status={order.status as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'} />
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">
                            {formatPrice(Number(order.totalAmount))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Acoes Rapidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/dashboard/tables">
                    🪑 Gerenciar Mesas
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/orders">
                    📋 Gerenciar Pedidos
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/menu">
                    🍽️ Gerenciar Cardapio
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/reports">
                    📊 Relatorios e Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

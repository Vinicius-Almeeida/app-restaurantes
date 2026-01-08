'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { waiterApi, type TableWithSession } from '@/lib/api/waiter';
import { ProtectedRoute } from '@/components/auth';
import { StatCard } from '@/components/dashboard';
import { OrderStatusBadge } from '@/components/order';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Clock, DollarSign, AlertCircle, Package, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  averageTicket: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  tableNumber: string | number;
  status: string;
  totalAmount: string | number;
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<TableWithSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    averageTicket: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingTables, setIsRefreshingTables] = useState(false);

  const fetchTables = useCallback(async (restaurantId: string, showToast = false) => {
    try {
      if (showToast) setIsRefreshingTables(true);
      const dashboardData = await waiterApi.getDashboard(restaurantId);
      setTables(Array.isArray(dashboardData.tables) ? dashboardData.tables : []);
      if (showToast) toast.success('Mesas atualizadas');
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (showToast) toast.error('Erro ao atualizar mesas');
    } finally {
      setIsRefreshingTables(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch owner's restaurant first
      const restaurantsResponse = await apiClient.get<{ data: Restaurant[] }>('/restaurants');
      const restaurants = restaurantsResponse.data.data;

      if (Array.isArray(restaurants) && restaurants.length > 0) {
        const ownerRestaurant = restaurants[0];
        setRestaurant(ownerRestaurant);

        // Fetch tables for this restaurant
        await fetchTables(ownerRestaurant.id);
      }

      const ordersResponse = await apiClient.get<{ data: RecentOrder[] }>('/orders');
      const orders = ordersResponse.data.data;

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(
        (o) => new Date(o.createdAt) >= today
      );

      const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const averageTicket = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
      const pendingOrders = orders.filter(
        (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
      ).length;

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        averageTicket,
        pendingOrders,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [fetchTables]);

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

  const handleRefreshTables = () => {
    if (restaurant) {
      fetchTables(restaurant.id, true);
    }
  };

  const handleTableClick = (tableId: string) => {
    if (restaurant) {
      router.push(`/waiter/${restaurant.id}/table/${tableId}`);
    }
  };

  // Sort tables: priority first (pending calls, ready orders), then occupied, then by number
  const sortedTables = [...tables].sort((a, b) => {
    if (a.hasPendingCall && !b.hasPendingCall) return -1;
    if (!a.hasPendingCall && b.hasPendingCall) return 1;
    if (a.hasReadyOrders && !b.hasReadyOrders) return -1;
    if (!a.hasReadyOrders && b.hasReadyOrders) return 1;
    if (a.session && !b.session) return -1;
    if (!a.session && b.session) return 1;
    return a.number - b.number;
  });

  const getTableStatusBadge = (table: TableWithSession) => {
    if (table.hasPendingCall) {
      return (
        <Badge className="animate-pulse bg-red-500 text-white border-red-600">
          Chamando
        </Badge>
      );
    }
    if (table.hasReadyOrders) {
      return (
        <Badge className="bg-yellow-500 text-white border-yellow-600">
          Pedido Pronto
        </Badge>
      );
    }
    if (table.session) {
      return (
        <Badge className="bg-green-500 text-white border-green-600">
          Ocupada
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
        Vazia
      </Badge>
    );
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
            title="Ticket Médio"
            value={formatPrice(stats.averageTicket)}
            icon="🎯"
          />
          <StatCard
            title="Pedidos Pendentes"
            value={stats.pendingOrders}
            icon="⏳"
            description="Aguardando confirmação"
          />
        </div>

        {/* Tables Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                🪑 Mesas do Restaurante
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTables}
                disabled={isRefreshingTables}
                className="gap-2"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshingTables && 'animate-spin')} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sortedTables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🪑</div>
                <p>Nenhuma mesa cadastrada ainda</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/dashboard/tables">Cadastrar Mesas</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedTables.map((table) => {
                  const hasSession = Boolean(table.session);
                  const isPriority = table.hasPendingCall || table.hasReadyOrders;

                  return (
                    <Card
                      key={table.id}
                      onClick={() => handleTableClick(table.id)}
                      className={cn(
                        'p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                        isPriority && 'ring-2 ring-yellow-400',
                        table.hasPendingCall && 'ring-red-500 animate-pulse'
                      )}
                      role="button"
                      tabIndex={0}
                      aria-label={`Mesa ${table.number}, ${hasSession ? 'ocupada' : 'vazia'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold">Mesa {table.number}</h3>
                          <p className="text-xs text-gray-500">
                            Capacidade: {table.capacity} pessoas
                          </p>
                        </div>
                        {getTableStatusBadge(table)}
                      </div>

                      {table.hasPendingCall && (
                        <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 rounded-md border border-red-200">
                          <AlertCircle className="size-4 text-red-600" />
                          <span className="text-xs font-medium text-red-600">
                            Cliente chamando!
                          </span>
                        </div>
                      )}

                      {table.hasReadyOrders && (
                        <div className="flex items-center gap-2 p-2 mb-3 bg-yellow-50 rounded-md border border-yellow-200">
                          <Package className="size-4 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-600">
                            {table.readyOrdersCount} pedido{table.readyOrdersCount > 1 ? 's' : ''} pronto{table.readyOrdersCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {hasSession && table.session && (
                        <div className="space-y-2 pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Users className="size-4" />
                              <span>{table.session.memberCount} cliente{table.session.memberCount > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="size-4" />
                              <span className="text-xs">
                                {formatDistanceToNow(new Date(table.session.startedAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="size-4 text-green-600" />
                              <span className="font-semibold text-green-600">
                                {formatPrice(table.session.totalAmount)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {table.session.orderCount} pedido{table.session.orderCount > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/orders">Ver Todos</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>Nenhum pedido ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium">
                              Mesa {order.tableNumber}
                            </p>
                            <OrderStatusBadge status={order.status as any} />
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
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/dashboard/orders">
                    📋 Gerenciar Pedidos
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/menu">
                    🍽️ Gerenciar Cardápio
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/reports">
                    📊 Relatórios e Analytics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/restaurants">
                    👁️ Ver Meu Restaurante
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

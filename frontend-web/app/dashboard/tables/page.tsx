'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { waiterApi, type TableWithSession } from '@/lib/api/waiter';
import { ProtectedRoute } from '@/components/auth';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Clock, DollarSign, AlertCircle, Package, RefreshCw, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

function TablesContent() {
  const { user } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<TableWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableWithSession | null>(null);

  const fetchTables = useCallback(async (restaurantId: string, showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const dashboardData = await waiterApi.getDashboard(restaurantId);
      setTables(Array.isArray(dashboardData.tables) ? dashboardData.tables : []);
      if (showToast) toast.success('Mesas atualizadas');
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (showToast) toast.error('Erro ao atualizar mesas');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const restaurantsResponse = await apiClient.get<{ data: Restaurant[] }>('/restaurants');
      const restaurants = restaurantsResponse.data.data;

      if (Array.isArray(restaurants) && restaurants.length > 0) {
        const ownerRestaurant = restaurants[0];
        setRestaurant(ownerRestaurant);
        await fetchTables(ownerRestaurant.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [fetchTables]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!restaurant) return;
    const interval = setInterval(() => fetchTables(restaurant.id), 30000);
    return () => clearInterval(interval);
  }, [restaurant, fetchTables]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleRefresh = () => {
    if (restaurant) {
      fetchTables(restaurant.id, true);
    }
  };

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

  const activeTables = tables.filter((t) => t.session).length;
  const pendingCallsCount = tables.filter((t) => t.hasPendingCall).length;
  const readyOrdersCount = tables.filter((t) => t.hasReadyOrders).length;

  if (isLoading) {
    return <LoadingScreen message="Carregando mesas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mesas</h1>
            <p className="text-gray-600">
              Gerencie as mesas do seu restaurante
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Atualizar
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
                <p className="text-sm text-gray-500">Total de Mesas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{activeTables}</p>
                <p className="text-sm text-gray-500">Mesas Ocupadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{pendingCallsCount}</p>
                <p className="text-sm text-gray-500">Chamando Garcom</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{readyOrdersCount}</p>
                <p className="text-sm text-gray-500">Pedidos Prontos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        {sortedTables.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🪑</div>
                <p className="text-lg">Nenhuma mesa cadastrada ainda</p>
                <p className="text-sm mt-2">
                  Configure as mesas do seu restaurante para comecar
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedTables.map((table) => {
              const hasSession = Boolean(table.session);
              const isPriority = table.hasPendingCall || table.hasReadyOrders;

              return (
                <Card
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
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

        {/* Table Detail Dialog */}
        <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">Mesa {selectedTable?.number}</span>
                {selectedTable && getTableStatusBadge(selectedTable)}
              </DialogTitle>
              <DialogDescription>
                Capacidade: {selectedTable?.capacity} pessoas
              </DialogDescription>
            </DialogHeader>

            {selectedTable?.hasPendingCall && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md border border-red-200">
                <AlertCircle className="size-5 text-red-600" />
                <span className="font-medium text-red-600">
                  Cliente esta chamando o garcom!
                </span>
              </div>
            )}

            {selectedTable?.hasReadyOrders && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <Package className="size-5 text-yellow-600" />
                <span className="font-medium text-yellow-600">
                  {selectedTable.readyOrdersCount} pedido{selectedTable.readyOrdersCount > 1 ? 's' : ''} pronto{selectedTable.readyOrdersCount > 1 ? 's' : ''} para entrega
                </span>
              </div>
            )}

            {selectedTable?.session ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sessao Ativa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="size-4" />
                        <span>Clientes</span>
                      </div>
                      <span className="font-semibold">{selectedTable.session.memberCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="size-4" />
                        <span>Tempo</span>
                      </div>
                      <span className="font-semibold">
                        {formatDistanceToNow(new Date(selectedTable.session.startedAt), {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="size-4" />
                        <span>Pedidos</span>
                      </div>
                      <span className="font-semibold">{selectedTable.session.orderCount}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="size-4" />
                        <span>Total</span>
                      </div>
                      <span className="font-bold text-lg text-green-600">
                        {formatPrice(selectedTable.session.totalAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-4xl mb-2">🪑</div>
                <p>Mesa disponivel</p>
                <p className="text-sm mt-1">Aguardando clientes</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTable(null)}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function TablesPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
      <TablesContent />
    </ProtectedRoute>
  );
}

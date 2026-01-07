'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { ProtectedRoute } from '@/components/auth';
import { OrderStatusBadge } from '@/components/order';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
type PeriodFilter = '7' | '15' | '30' | 'custom';

interface Order {
  id: string;
  tableNumber: number | string;
  status: OrderStatus;
  totalAmount: number | string;
  createdAt: string;
  customer?: {
    fullName?: string;
  };
}

function OrdersManagementContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('7');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get<{ data: Order[] }>('/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by date period
  const ordersInPeriod = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (periodFilter === 'custom') {
      if (!customStartDate || !customEndDate) return orders;
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(periodFilter, 10);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, periodFilter, customStartDate, customEndDate]);

  // Filter by status tab
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') {
      return ordersInPeriod;
    }
    return ordersInPeriod.filter((o) => o.status === activeTab);
  }, [ordersInPeriod, activeTab]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');

      // Update local state
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (error: unknown) {
      console.error('Error updating order status:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Erro ao atualizar status');
    }
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return ordersInPeriod.length;
    return ordersInPeriod.filter((o) => o.status === status).length;
  };

  const getPeriodLabel = () => {
    switch (periodFilter) {
      case '7': return 'Últimos 7 dias';
      case '15': return 'Últimos 15 dias';
      case '30': return 'Últimos 30 dias';
      case 'custom': return 'Período personalizado';
      default: return '';
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando pedidos..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Pedidos</h1>
          <p className="text-gray-600">Visualize e gerencie todos os pedidos do seu restaurante</p>
        </div>

        {/* Period Filter */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Período</Label>
                <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="15">Últimos 15 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {periodFilter === 'custom' && (
                <>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Data Inicial</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-[160px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Data Final</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-[160px]"
                    />
                  </div>
                </>
              )}

              <div className="ml-auto text-right">
                <p className="text-sm text-gray-500">{getPeriodLabel()}</p>
                <p className="text-lg font-bold text-orange-600">
                  {ordersInPeriod.length} pedidos | {formatPrice(ordersInPeriod.reduce((sum, o) => sum + Number(o.totalAmount), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              Todos ({getStatusCount('all')})
            </TabsTrigger>
            <TabsTrigger value="PENDING">
              Pendentes ({getStatusCount('PENDING')})
            </TabsTrigger>
            <TabsTrigger value="CONFIRMED">
              Confirmados ({getStatusCount('CONFIRMED')})
            </TabsTrigger>
            <TabsTrigger value="PREPARING">
              Preparando ({getStatusCount('PREPARING')})
            </TabsTrigger>
            <TabsTrigger value="READY">
              Prontos ({getStatusCount('READY')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl">Nenhum pedido encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold">
                              Mesa {order.tableNumber}
                            </h3>
                            <OrderStatusBadge status={order.status} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Cliente</p>
                              <p className="font-medium">{order.customer?.fullName || 'Cliente não identificado'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Data/Hora</p>
                              <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Valor Total</p>
                              <p className="font-bold text-orange-600">
                                {formatPrice(Number(order.totalAmount))}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateStatus(order.id, value as OrderStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pendente</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                              <SelectItem value="PREPARING">Preparando</SelectItem>
                              <SelectItem value="READY">Pronto</SelectItem>
                              <SelectItem value="DELIVERED">Entregue</SelectItem>
                              <SelectItem value="CANCELLED">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function OrdersManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
      <OrdersManagementContent />
    </ProtectedRoute>
  );
}

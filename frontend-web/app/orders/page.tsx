'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { OrderStatusBadge } from '@/components/order';
import { LoadingScreen } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  restaurant: {
    name: string;
    slug: string;
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('active');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    filterOrders();
  }, [activeTab, orders]);

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

  const filterOrders = () => {
    if (activeTab === 'active') {
      setFilteredOrders(
        orders.filter(
          (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
        )
      );
    } else if (activeTab === 'completed') {
      setFilteredOrders(
        orders.filter((o) => o.status === 'DELIVERED')
      );
    } else {
      setFilteredOrders(orders);
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

  const getStatusCount = (filter: string) => {
    if (filter === 'active') {
      return orders.filter(
        (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
      ).length;
    }
    if (filter === 'completed') {
      return orders.filter((o) => o.status === 'DELIVERED').length;
    }
    return orders.length;
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando seus pedidos..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe todos os seus pedidos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Ativos ({getStatusCount('active')})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Finalizados ({getStatusCount('completed')})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos ({getStatusCount('all')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h2 className="text-xl font-semibold mb-2">
                    {activeTab === 'active'
                      ? 'Nenhum pedido ativo'
                      : 'Nenhum pedido encontrado'}
                  </h2>
                  <p>
                    {activeTab === 'active'
                      ? 'Faça seu primeiro pedido em um restaurante!'
                      : 'Você ainda não fez nenhum pedido'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold">
                              {order.restaurant.name}
                            </h3>
                            <OrderStatusBadge status={order.status} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Mesa</p>
                              <p className="font-medium">Mesa {order.tableNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Data/Hora</p>
                              <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Valor Total</p>
                              <p className="font-bold text-orange-600">
                                {formatPrice(order.totalAmount)}
                              </p>
                            </div>
                          </div>
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

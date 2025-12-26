'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { OrderStatusBadge } from '@/components/order';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
}

interface Participant {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Order {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  notes?: string;
  totalAmount: number;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  items: OrderItem[];
  participants: Participant[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await apiClient.get<{ data: Order }>(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error: unknown) {
      console.error('Error fetching order:', error);
      toast.error('Erro ao carregar pedido');
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        router.push('/restaurants');
      }
    } finally {
      setIsLoading(false);
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

  const handleSplitBill = () => {
    router.push(`/split-bill/${orderId}`);
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando pedido..." />;
  }

  if (!order) {
    return null;
  }

  const canSplitBill = order.status !== 'CANCELLED' && order.status !== 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-gray-600">
              {order.restaurant.name} • Mesa {order.tableNumber}
            </p>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Itens do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(order.items) && order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.menuItem.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x {formatPrice(item.price)}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-400 italic mt-1">Obs: {item.notes}</p>
                          )}
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
                  </div>

                  {order.notes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Participants */}
              {Array.isArray(order.participants) && order.participants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Participantes ({order.participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-700 font-semibold">
                              {participant.user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{participant.user.fullName}</p>
                            <p className="text-sm text-gray-500">{participant.user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSplitBill}
                    disabled={!canSplitBill}
                  >
                    🧾 Rachar Conta
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/r/${order.restaurant.slug}`}>
                      Adicionar Mais Itens
                    </Link>
                  </Button>

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/restaurants')}
                  >
                    Voltar aos Restaurantes
                  </Button>

                  {!canSplitBill && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      A divisão de conta estará disponível após a confirmação do pedido
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

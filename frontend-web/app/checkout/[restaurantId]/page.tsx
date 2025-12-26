'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/common';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Carrinho está vazio');
      return;
    }

    if (!tableNumber) {
      toast.error('Por favor, informe o número da mesa');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const orderData = {
        restaurantId,
        tableNumber: parseInt(tableNumber),
        notes: notes || undefined,
      };

      const orderResponse = await apiClient.post<{ data: { id: string } }>('/orders', orderData);
      const orderId = orderResponse.data.data.id;

      // Add items to order
      for (const item of items) {
        await apiClient.post(`/orders/${orderId}/items`, {
          menuItemId: item.id,
          quantity: item.quantity,
          notes: '',
        });
      }

      toast.success('Pedido criado com sucesso!');
      clearCart();
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Criando seu pedido..." />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Carrinho Vazio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.</p>
            <Button onClick={() => router.push('/restaurants')} className="w-full">
              Ver Restaurantes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tableNumber">Número da Mesa *</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      placeholder="Ex: 12"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Input
                      id="notes"
                      placeholder="Ex: Sem cebola, bem passado..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Cliente</Label>
                    <p className="text-sm text-gray-600 mt-1">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">{formatPrice(getTotal())}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button onClick={handleSubmitOrder} className="w-full" size="lg">
                      Confirmar Pedido
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="w-full"
                    >
                      Voltar ao Menu
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Ao confirmar, seu pedido será enviado para a cozinha
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

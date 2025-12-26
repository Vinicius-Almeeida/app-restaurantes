'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useCartStore } from '@/lib/stores/cart-store';
import { MenuItemCard } from '@/components/menu';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  acceptingOrders: boolean;
}

export default function TableMenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const tableNumber = parseInt(params.tableNumber as string, 10);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
    clearCart,
    setRestaurant: setCartRestaurant,
    setTableNumber: setCartTableNumber,
  } = useCartStore();

  useEffect(() => {
    if (isNaN(tableNumber) || tableNumber <= 0) {
      toast.error('Numero da mesa invalido');
      router.push('/');
      return;
    }

    fetchRestaurantData();
  }, [restaurantId, tableNumber]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant by ID
      const restaurantRes = await apiClient.get<{ data: Restaurant }>(`/restaurants/${restaurantId}`);
      const restaurantData = restaurantRes.data.data;

      setRestaurant(restaurantData);
      setCartRestaurant(restaurantData.id);
      setCartTableNumber(tableNumber);

      // Fetch menu using the restaurant ID
      const menuRes = await apiClient.get<{ data: Category[] }>(`/menu/restaurant/${restaurantData.id}/full`);
      const menuData = Array.isArray(menuRes.data.data) ? menuRes.data.data : [];
      setCategories(menuData);
    } catch (error: unknown) {
      console.error('Error fetching restaurant data:', error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error('Restaurante nao encontrado');
        router.push('/');
      } else {
        toast.error('Erro ao carregar dados do restaurante');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    addItem(item);
    toast.success(`${item.name} adicionado ao carrinho`);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho esta vazio');
      return;
    }

    router.push(`/checkout/${restaurant?.id}`);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando cardapio..." />;
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with table info */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Mesa {tableNumber}
                </Badge>
              </div>
              {restaurant.description && (
                <p className="text-gray-600 mb-3">{restaurant.description}</p>
              )}
            </div>
            <div>
              {restaurant.acceptingOrders ? (
                <Badge className="bg-green-600">Aberto</Badge>
              ) : (
                <Badge variant="secondary">Fechado</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Cardapio em construcao
                </h2>
                <p className="text-gray-500">Este restaurante ainda nao tem itens no menu</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category.id}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(category.items) &&
                        category.items.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            {...item}
                            category={category.name}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      Carrinho ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})
                    </CardTitle>
                    <Badge variant="outline">Mesa {tableNumber}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>Seu carrinho esta vazio</p>
                      <p className="text-sm mt-2">Adicione itens do cardapio</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600"
                              >
                                X
                              </Button>
                            </div>
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
                      <div className="mt-4 space-y-2">
                        <Button
                          className="w-full"
                          onClick={handleCheckout}
                          disabled={!restaurant.acceptingOrders}
                        >
                          Finalizar Pedido
                        </Button>
                        <Button variant="outline" className="w-full" onClick={clearCart}>
                          Limpar Carrinho
                        </Button>
                      </div>
                    </>
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

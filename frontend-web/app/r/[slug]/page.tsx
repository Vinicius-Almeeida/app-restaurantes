'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuthStore } from '@/lib/stores/auth-store';
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

export default function RestaurantMenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  const { items, addItem, removeItem, updateQuantity, getTotal, getItemCount, clearCart, setRestaurant: setCartRestaurant } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchRestaurantData();
  }, [slug]);

  const fetchRestaurantData = async () => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        apiClient.get<{ data: Restaurant }>(`/restaurants/slug/${slug}`),
        apiClient.get<{ data: Category[] }>(`/menu/restaurant/${slug}/full`),
      ]);

      setRestaurant(restaurantRes.data.data);
      setCategories(menuRes.data.data);
      setCartRestaurant(restaurantRes.data.data.id);
    } catch (error: any) {
      console.error('Error fetching restaurant data:', error);
      if (error.response?.status === 404) {
        toast.error('Restaurante não encontrado');
        router.push('/restaurants');
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
    setShowCart(true);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para continuar');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
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
    return <LoadingScreen message="Carregando cardápio..." />;
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-gray-600 mb-3">{restaurant.description}</p>
              )}
              {restaurant.address && (
                <p className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                  <span>📍</span>
                  <span>{restaurant.address}</span>
                </p>
              )}
              {restaurant.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>📞</span>
                  <span>{restaurant.phone}</span>
                </p>
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
          <div className="lg:col-span-2">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Cardápio em construção
                </h2>
                <p className="text-gray-500">Este restaurante ainda não tem itens no menu</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category.id}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item) => (
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

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Carrinho ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>Seu carrinho está vazio</p>
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
                                ✕
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
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={clearCart}
                        >
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

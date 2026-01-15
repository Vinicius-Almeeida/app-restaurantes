'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { tablesApi, type PublicTable } from '@/lib/api/tables';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { MenuItemCard } from '@/components/menu';
import { LoadingScreen } from '@/components/common';
import { CustomerTableGrid, TableSelectionModal } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: string;
  prepTime?: number;
  servingSize?: string;
  avgRating?: number;
  ratingCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface MenuResponse {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
  };
  categories: Category[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  acceptsOrders: boolean;
}

type ViewMode = 'tables' | 'menu';

export default function RestaurantMenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<PublicTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('tables');

  // Table selection state
  const [selectedTable, setSelectedTable] = useState<PublicTable | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [isJoiningTable, setIsJoiningTable] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const { items, addItem, removeItem, updateQuantity, getTotal, getItemCount, clearCart, setRestaurant: setCartRestaurant } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const fetchRestaurantData = useCallback(async () => {
    try {
      // Fetch restaurant by slug
      const restaurantRes = await apiClient.get<{ data: Restaurant }>(`/restaurants/slug/${slug}`);
      const restaurantData = restaurantRes.data.data;

      setRestaurant(restaurantData);
      setCartRestaurant(restaurantData.id);

      // Fetch tables and menu in parallel
      const [tablesData, menuRes] = await Promise.all([
        tablesApi.getPublicTables(restaurantData.id),
        apiClient.get<{ data: MenuResponse }>(`/menu/restaurant/${restaurantData.id}/full`),
      ]);

      setTables(tablesData);
      const menuData = menuRes.data.data?.categories;
      setCategories(Array.isArray(menuData) ? menuData : []);
    } catch (error: unknown) {
      console.error('Error fetching restaurant data:', error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error('Restaurante não encontrado');
        router.push('/restaurants');
      } else {
        toast.error('Erro ao carregar dados do restaurante');
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, router, setCartRestaurant]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleTableSelect = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table && !table.isOccupied) {
      setSelectedTable(table);
      setShowTableModal(true);
    }
  };

  const handleConfirmTable = async () => {
    if (!selectedTable) return;

    if (!isAuthenticated) {
      toast.error('Faça login para ocupar uma mesa');
      router.push('/login');
      return;
    }

    setIsJoiningTable(true);
    try {
      const result = await tablesApi.startSession(selectedTable.id);

      if (result.isOwner) {
        toast.success(`Você é o dono da Mesa ${selectedTable.number}!`);
      } else if (result.needsApproval) {
        toast.info('Aguardando aprovação do dono da mesa...');
      }

      setActiveTableId(selectedTable.id);
      setShowTableModal(false);
      setViewMode('menu');

      // Refresh tables to update occupancy
      const updatedTables = await tablesApi.getPublicTables(restaurant!.id);
      setTables(updatedTables);
    } catch (error) {
      console.error('Error joining table:', error);
      toast.error('Erro ao ocupar mesa. Tente novamente.');
    } finally {
      setIsJoiningTable(false);
    }
  };

  const handleScanQr = () => {
    // TODO: Implement QR code scanner
    toast.info('Funcionalidade de leitura de QR Code em desenvolvimento');
    setShowTableModal(false);
  };

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    addItem(item);
    toast.success(`${item.name} adicionado ao carrinho`);
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

  const activeTable = tables.find((t) => t.id === activeTableId);

  if (isLoading) {
    return <LoadingScreen message="Carregando restaurante..." />;
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
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
              {activeTable && (
                <Badge variant="outline" className="mt-2 gap-2">
                  🪑 Mesa {activeTable.number}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {restaurant.acceptsOrders ? (
                <Badge className="bg-green-600">Aberto</Badge>
              ) : (
                <Badge variant="secondary">Fechado</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tables" className="gap-2">
              🪑 Mesas
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              📋 Cardápio
            </TabsTrigger>
          </TabsList>

          {/* Tables View */}
          <TabsContent value="tables" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha sua Mesa</h2>
              <p className="text-gray-600">
                Selecione uma mesa disponível para começar a fazer seu pedido
              </p>
            </div>
            <CustomerTableGrid
              tables={tables}
              selectedTableId={activeTableId || undefined}
              onTableSelect={handleTableSelect}
              emptyMessage="Este restaurante ainda não tem mesas cadastradas"
            />
          </TabsContent>

          {/* Menu View */}
          <TabsContent value="menu" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {!activeTableId && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Selecione uma mesa na aba "Mesas" para fazer pedidos.</span>
                    </p>
                    <Button
                      variant="link"
                      className="text-yellow-700 p-0 h-auto mt-1"
                      onClick={() => setViewMode('tables')}
                    >
                      <ArrowLeft className="size-4 mr-1" />
                      Ir para seleção de mesas
                    </Button>
                  </div>
                )}

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
                          {category.menuItems.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              id={item.id}
                              name={item.name}
                              description={item.description}
                              price={Number(item.price)}
                              imageUrl={item.imageUrl}
                              isAvailable={item.isAvailable}
                              prepTime={item.prepTime}
                              avgRating={item.avgRating ? Number(item.avgRating) : undefined}
                              ratingCount={item.ratingCount}
                              isFeatured={item.isFeatured}
                              isNew={item.isNew}
                              tags={item.tags}
                              onAddToCart={activeTableId ? handleAddToCart : undefined}
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
                              disabled={!restaurant.acceptsOrders || !activeTableId}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Table Selection Modal */}
      <TableSelectionModal
        table={selectedTable}
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onConfirm={handleConfirmTable}
        onScanQr={handleScanQr}
        isLoading={isJoiningTable}
      />
    </div>
  );
}

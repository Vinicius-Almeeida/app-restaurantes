'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';
import { ProtectedRoute } from '@/components/auth';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  isAvailable: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  menuItems: MenuItem[];
}

function MenuManagementContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);

  // Get active category
  const activeCategory = useMemo(() => {
    if (!activeCategoryId && categories.length > 0) {
      return categories[0];
    }
    return categories.find((c) => c.id === activeCategoryId) || null;
  }, [activeCategoryId, categories]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      // Get restaurant first
      const restaurantsRes = await apiClient.get<{ data: any[] }>('/restaurants');
      if (restaurantsRes.data.data.length === 0) {
        toast.error('Você precisa criar um restaurante primeiro');
        return;
      }

      const restaurantId = restaurantsRes.data.data[0].id;

      // Get menu
      const menuRes = await apiClient.get<{ data: { categories: Category[] } }>(`/menu/restaurant/${restaurantId}/full`);
      setCategories(menuRes.data.data?.categories || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Erro ao carregar cardápio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
      toast.error('Digite o nome da categoria');
      return;
    }

    try {
      const restaurantsRes = await apiClient.get<{ data: any[] }>('/restaurants');
      const restaurantId = restaurantsRes.data.data[0].id;

      await apiClient.post('/menu/categories', {
        name: newCategoryName,
        restaurantId,
        displayOrder: categories.length + 1,
      });

      toast.success('Categoria criada com sucesso!');
      setNewCategoryName('');
      setShowCategoryDialog(false);
      fetchMenu();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar categoria');
    }
  };

  const handleCreateItem = async () => {
    if (!newItemName || !newItemPrice || !selectedCategoryForItem) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apiClient.post('/menu/items', {
        name: newItemName,
        description: newItemDescription || undefined,
        price: parseFloat(newItemPrice),
        categoryId: selectedCategoryForItem,
      });

      toast.success('Item criado com sucesso!');
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDescription('');
      setShowItemDialog(false);
      fetchMenu();
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar item');
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      await apiClient.patch(`/menu/items/${itemId}/toggle-availability`);
      toast.success('Disponibilidade atualizada!');
      fetchMenu();
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      toast.error('Erro ao atualizar disponibilidade');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      await apiClient.delete(`/menu/items/${itemId}`);
      toast.success('Item excluído!');
      fetchMenu();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Cardápio</h1>
            <p className="text-gray-600">Organize categorias e itens do seu menu</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button>+ Nova Categoria</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome da Categoria *</Label>
                    <Input
                      placeholder="Ex: Entradas, Pratos Principais..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateCategory} className="w-full">
                    Criar Categoria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">+ Novo Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Categoria *</Label>
                    <Select value={selectedCategoryForItem} onValueChange={setSelectedCategoryForItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nome do Item *</Label>
                    <Input
                      placeholder="Ex: Hambúrguer Artesanal"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Ex: Pão artesanal, 200g de carne..."
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Preço *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateItem} className="w-full">
                    Criar Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-xl font-semibold mb-2">Nenhuma categoria criada</h2>
              <p className="mb-4">Comece criando categorias para organizar seu cardápio</p>
              <Button onClick={() => setShowCategoryDialog(true)}>
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Category Selector Dropdown */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">Categoria:</Label>
              <Select
                value={activeCategoryId || categories[0]?.id}
                onValueChange={setActiveCategoryId}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.menuItems?.length || 0} itens)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Category Content */}
            {activeCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>{activeCategory.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!activeCategory.menuItems || activeCategory.menuItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum item nesta categoria</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeCategory.menuItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <Badge
                                variant={item.isAvailable ? 'default' : 'secondary'}
                                className={item.isAvailable ? 'bg-green-600' : ''}
                              >
                                {item.isAvailable ? 'Disponível' : 'Indisponível'}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            )}
                            <p className="text-lg font-bold text-orange-600">
                              {formatPrice(Number(item.price))}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAvailability(item.id)}
                            >
                              {item.isAvailable ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
      <MenuManagementContent />
    </ProtectedRoute>
  );
}

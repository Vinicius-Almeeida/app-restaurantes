'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Upload,
  Plus,
  Search,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { InventoryDashboard, InventoryItem } from '@/lib/types/inventory';

export default function InventoryDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchItems();
  }, [filterLowStock]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/inventory/dashboard');
      setDashboard((response.data as any).data);
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterLowStock) params.lowStock = 'true';

      const response = await api.get('/inventory/items', { params });
      setItems((response.data as any).data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      toast.error('Erro ao carregar itens de estoque');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: InventoryItem) => {
    if (!item.trackStock) return { color: 'gray', label: 'Não rastreado' };
    if (item.currentStock <= 0) return { color: 'red', label: 'Sem estoque' };
    if (item.currentStock <= item.minimumStock) return { color: 'yellow', label: 'Baixo' };
    return { color: 'green', label: 'OK' };
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
            <p className="text-gray-600 mt-2">
              Gerencie seu inventário e notas fiscais com processamento automático
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/inventory/upload')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload de Nota Fiscal
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/inventory/items/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold">{dashboard.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboard.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor em Estoque</p>
                <p className="text-2xl font-bold">
                  R$ {dashboard.totalValue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entradas Recentes</p>
                <p className="text-2xl font-bold">{dashboard.recentEntries.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={filterLowStock ? 'default' : 'outline'}
            onClick={() => setFilterLowStock(!filterLowStock)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {filterLowStock ? 'Mostrando apenas estoque baixo' : 'Filtrar estoque baixo'}
          </Button>
        </div>
      </Card>

      {/* Lista de Itens */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Itens de Estoque</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum item encontrado</p>
            <Button onClick={() => router.push('/dashboard/inventory/upload')}>
              <Upload className="w-4 h-4 mr-2" />
              Fazer Upload de Nota Fiscal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">SKU</th>
                  <th className="text-left p-3">Estoque Atual</th>
                  <th className="text-left p-3">Estoque Mínimo</th>
                  <th className="text-left p-3">Unidade</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Preço Médio</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/inventory/items/${item.id}`)}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">{item.sku || '-'}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-medium ${
                            item.currentStock <= item.minimumStock
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">{item.minimumStock}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">{item.unit}</span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            status.color === 'red'
                              ? 'destructive'
                              : status.color === 'yellow'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {item.averagePrice
                            ? `R$ ${item.averagePrice.toFixed(2)}`
                            : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Fornecedores Top */}
      {dashboard && dashboard.topSuppliers.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Top Fornecedores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboard.topSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/dashboard/inventory/suppliers/${supplier.id}`)}
              >
                <p className="font-medium">{supplier.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {supplier._count.stockEntries} entradas
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

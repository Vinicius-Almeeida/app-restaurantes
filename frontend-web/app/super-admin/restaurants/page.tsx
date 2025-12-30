'use client';

/**
 * Super Admin - Restaurants List Page
 * FAANG-level enterprise page for managing all restaurants on the platform.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  adminApi,
  type Restaurant,
  type ListRestaurantsParams,
  type Plan,
} from '@/lib/api/admin';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
} as const;

const STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
} as const;

function RestaurantsListContent() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<ListRestaurantsParams>({
    page: 1,
    limit: 10,
    status: undefined,
    planId: undefined,
    search: '',
  });

  const [plans, setPlans] = useState<Plan[]>([]);

  const fetchRestaurants = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setIsRefreshing(true);
      }

      const cleanFilters: ListRestaurantsParams = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.status) {
        cleanFilters.status = filters.status;
      }

      if (filters.planId) {
        cleanFilters.planId = filters.planId;
      }

      if (filters.search && filters.search.trim().length > 0) {
        cleanFilters.search = filters.search.trim();
      }

      const response = await adminApi.listRestaurants(cleanFilters);

      setRestaurants(Array.isArray(response.restaurants) ? response.restaurants : []);
      setTotalPages(response.pages);
      setTotalCount(response.total);

      if (showToast) {
        toast.success('Lista atualizada');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Erro ao carregar restaurantes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  const fetchPlans = useCallback(async () => {
    try {
      const plansData = await adminApi.listPlans();
      setPlans(Array.isArray(plansData) ? plansData.filter((plan) => plan.isActive) : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRestaurants();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchRestaurants]);

  const handleRefresh = () => {
    fetchRestaurants(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      status: value === 'all' ? undefined : (value as 'active' | 'inactive'),
    }));
  };

  const handlePlanFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      planId: value === 'all' ? undefined : value,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handleRowClick = (restaurantId: string) => {
    router.push(`/super-admin/restaurants/${restaurantId}`);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    const status = isActive ? 'ACTIVE' : 'INACTIVE';
    return (
      <Badge
        variant="outline"
        className={STATUS_COLORS[status]}
        aria-label={`Status: ${STATUS_LABELS[status]}`}
      >
        {STATUS_LABELS[status]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando restaurantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurantes
          </h1>
          <p className="text-gray-600">
            Gerencie todos os restaurantes da plataforma
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                aria-label="Buscar restaurantes"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger aria-label="Filtrar por status">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>

            {/* Plan Filter */}
            <Select
              value={filters.planId || 'all'}
              onValueChange={handlePlanFilter}
            >
              <SelectTrigger aria-label="Filtrar por plano">
                <SelectValue placeholder="Todos os planos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Lista de Restaurantes
            </span>
            <span className="text-sm font-normal text-gray-500">
              {totalCount} {totalCount === 1 ? 'restaurante' : 'restaurantes'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {restaurants.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg mb-2">
                Nenhum restaurante encontrado
              </p>
              <p className="text-gray-400 text-sm">
                Tente ajustar os filtros ou adicionar um novo restaurante
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Proprietario
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Plano
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Pedidos
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Data de Criacao
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant) => (
                      <tr
                        key={restaurant.id}
                        onClick={() => handleRowClick(restaurant.id)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleRowClick(restaurant.id);
                          }
                        }}
                        aria-label={`Ver detalhes de ${restaurant.name}`}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {restaurant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              /{restaurant.slug}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-gray-900">
                              {restaurant.owner.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {restaurant.owner.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {restaurant.subscription?.plan ? (
                            <span className="text-gray-900 font-medium">
                              {restaurant.subscription.plan.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Sem plano
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(restaurant.isActive)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">
                            {restaurant._count.orders}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600">
                            {formatDate(restaurant.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Pagina {filters.page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                      disabled={filters.page === 1}
                      aria-label="Pagina anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((filters.page ?? 1) + 1)}
                      disabled={filters.page === totalPages}
                      aria-label="Proxima pagina"
                    >
                      Proxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RestaurantsListPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <RestaurantsListContent />
    </ProtectedRoute>
  );
}

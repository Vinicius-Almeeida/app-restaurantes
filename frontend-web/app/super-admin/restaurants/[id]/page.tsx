'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi, type RestaurantDetails } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  RefreshCw,
  Store,
  User,
  CreditCard,
  Package,
  Users,
  Star,
  Utensils,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

function RestaurantDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRestaurantDetails = async () => {
    try {
      setError(null);
      const data = await adminApi.getRestaurantDetails(restaurantId);
      setRestaurant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRestaurantDetails();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Restaurante nao encontrado'}</p>
            <Button onClick={() => router.push('/super-admin/restaurants')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/super-admin/restaurants')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600">/{restaurant.slug}</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informacoes do Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Email:</span>
              <span>{restaurant.email || 'Nao informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Telefone:</span>
              <span>{restaurant.phone || 'Nao informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Criado em:</span>
              <span>{formatDate(restaurant.createdAt)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {restaurant.isActive ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">Status:</span>
              <Badge variant={restaurant.isActive ? 'default' : 'destructive'}>
                {restaurant.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            {restaurant.description && (
              <div className="text-sm">
                <span className="font-medium">Descricao:</span>
                <p className="text-gray-600 mt-1">{restaurant.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Owner Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Proprietario
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600">Nome</p>
            <p className="font-medium">{restaurant.owner.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{restaurant.owner.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Telefone</p>
            <p className="font-medium">{restaurant.owner.phone || 'Nao informado'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      {restaurant.subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano e Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600">Plano</p>
              <p className="font-medium text-lg">{restaurant.subscription.plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preco</p>
              <p className="font-medium text-lg">{formatCurrency(restaurant.subscription.plan.price)}/mes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Limites</p>
              <div className="text-sm space-y-1">
                <p>Mesas: {restaurant.subscription.plan.maxTables}</p>
                <p>Itens: {restaurant.subscription.plan.maxMenuItems}</p>
                <p>Staff: {restaurant.subscription.plan.maxStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold">{restaurant._count.orders}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Itens do Cardapio</p>
                <p className="text-2xl font-bold">{restaurant._count.menuItems}</p>
              </div>
              <Utensils className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Equipe</p>
                <p className="text-2xl font-bold">{restaurant._count.staff}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliacoes</p>
                <p className="text-2xl font-bold">{restaurant._count.reviews}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mesas</p>
                <p className="text-2xl font-bold">{restaurant._count.tables}</p>
              </div>
              <Store className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(restaurant.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NPS Score</p>
                <p className="text-2xl font-bold">
                  {restaurant.nps !== null ? restaurant.nps.toFixed(1) : 'N/A'}
                </p>
                {restaurant.nps !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    {restaurant.nps >= 75 ? 'Excelente' : restaurant.nps >= 50 ? 'Muito bom' : restaurant.nps >= 0 ? 'Bom' : 'Precisa melhorar'}
                  </p>
                )}
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RestaurantDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <RestaurantDetailsContent />
    </ProtectedRoute>
  );
}

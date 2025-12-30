'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  ShoppingCart,
  CreditCard,
  Users,
  Store,
  TrendingUp,
  Clock,
  ArrowLeft,
  RefreshCw,
  Utensils,
  CheckCircle,
  Timer,
} from 'lucide-react';
import Link from 'next/link';

interface RealtimeOrder {
  id: string;
  restaurantName: string;
  tableNumber: number;
  items: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED';
  createdAt: string;
}

interface RealtimePayment {
  id: string;
  restaurantName: string;
  amount: number;
  method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp: string;
}

interface RealtimeStats {
  activeRestaurants: number;
  activeSessions: number;
  ordersInProgress: number;
  paymentsProcessing: number;
  gmvToday: number;
  ordersToday: number;
}

const ORDER_STATUS_CONFIG = {
  PENDING: { label: 'Pendente', className: 'bg-gray-100 text-gray-800' },
  CONFIRMED: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'Preparando', className: 'bg-yellow-100 text-yellow-800' },
  READY: { label: 'Pronto', className: 'bg-green-100 text-green-800' },
  DELIVERED: { label: 'Entregue', className: 'bg-gray-100 text-gray-800' },
};

const PAYMENT_STATUS_CONFIG = {
  PROCESSING: { label: 'Processando', className: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Concluido', className: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Falhou', className: 'bg-red-100 text-red-800' },
};

function RealtimePageContent() {
  const [stats, setStats] = useState<RealtimeStats>({
    activeRestaurants: 127,
    activeSessions: 843,
    ordersInProgress: 256,
    paymentsProcessing: 12,
    gmvToday: 45720.5,
    ordersToday: 1847,
  });

  const [recentOrders, setRecentOrders] = useState<RealtimeOrder[]>([
    {
      id: '1',
      restaurantName: 'Pizzaria Bella',
      tableNumber: 5,
      items: 3,
      total: 89.9,
      status: 'PREPARING',
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: '2',
      restaurantName: 'Sushi Master',
      tableNumber: 12,
      items: 5,
      total: 156.0,
      status: 'CONFIRMED',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '3',
      restaurantName: 'Burger House',
      tableNumber: 3,
      items: 2,
      total: 54.9,
      status: 'READY',
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: '4',
      restaurantName: 'Cantina Italiana',
      tableNumber: 8,
      items: 4,
      total: 124.5,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1000 * 30).toISOString(),
    },
    {
      id: '5',
      restaurantName: 'Cafe Central',
      tableNumber: 1,
      items: 2,
      total: 32.0,
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ]);

  const [recentPayments, setRecentPayments] = useState<RealtimePayment[]>([
    {
      id: '1',
      restaurantName: 'Pizzaria Bella',
      amount: 89.9,
      method: 'PIX',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    },
    {
      id: '2',
      restaurantName: 'Sushi Master',
      amount: 156.0,
      method: 'CREDIT_CARD',
      status: 'PROCESSING',
      timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
    },
    {
      id: '3',
      restaurantName: 'Burger House',
      amount: 54.9,
      method: 'DEBIT_CARD',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
  ]);

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simular atualizacao de stats em tempo real
      setStats((prev) => ({
        ...prev,
        activeSessions: Math.max(700, prev.activeSessions + Math.floor((Math.random() - 0.5) * 20)),
        ordersInProgress: Math.max(200, prev.ordersInProgress + Math.floor((Math.random() - 0.5) * 10)),
        paymentsProcessing: Math.max(5, Math.min(30, prev.paymentsProcessing + Math.floor((Math.random() - 0.5) * 5))),
        gmvToday: prev.gmvToday + Math.random() * 50,
        ordersToday: prev.ordersToday + Math.floor(Math.random() * 3),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    return `${Math.floor(diffMins / 60)}h`;
  };

  const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      CREDIT_CARD: 'Credito',
      DEBIT_CARD: 'Debito',
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/operations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoramento em Tempo Real</h1>
            <p className="text-gray-600">Acompanhe pedidos e transacoes ao vivo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">{isLive ? 'AO VIVO' : 'PAUSADO'}</span>
          </div>
          <Button variant="outline" onClick={() => setIsLive(!isLive)}>
            {isLive ? 'Pausar' : 'Retomar'}
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Restaurantes Ativos</p>
                <p className="text-xl font-bold">{stats.activeRestaurants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Sessoes Ativas</p>
                <p className="text-xl font-bold">{stats.activeSessions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Utensils className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pedidos em Andamento</p>
                <p className="text-xl font-bold">{stats.ordersInProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pagamentos Processando</p>
                <p className="text-xl font-bold">{stats.paymentsProcessing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">GMV Hoje</p>
                <p className="text-xl font-bold">{formatCurrency(stats.gmvToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pedidos Hoje</p>
                <p className="text-xl font-bold">{stats.ordersToday.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos Recentes
              <Badge variant="secondary" className="ml-auto">
                {recentOrders.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status];
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{order.restaurantName}</p>
                        <Badge variant="outline" className="text-xs">
                          Mesa {order.tableNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{order.items} itens</span>
                        <span>•</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeSince(order.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagamentos Recentes
              <Badge variant="secondary" className="ml-auto">
                {recentPayments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((payment) => {
                const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${
                      payment.status === 'COMPLETED' ? 'bg-green-100' :
                      payment.status === 'PROCESSING' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {payment.status === 'COMPLETED' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : payment.status === 'PROCESSING' ? (
                        <Timer className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{payment.restaurantName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{getMethodLabel(payment.method)}</span>
                        <span>•</span>
                        <span>{formatTime(payment.timestamp)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {[
                { time: 'Agora', event: 'Novo pedido recebido', restaurant: 'Pizzaria Bella', type: 'order' },
                { time: '30s', event: 'Pagamento PIX confirmado', restaurant: 'Sushi Master', type: 'payment' },
                { time: '1min', event: 'Pedido pronto para entrega', restaurant: 'Burger House', type: 'status' },
                { time: '2min', event: 'Nova sessao iniciada', restaurant: 'Cantina Italiana', type: 'session' },
                { time: '3min', event: 'Pedido confirmado pela cozinha', restaurant: 'Cafe Central', type: 'status' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 pl-8 relative">
                  <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${
                    item.type === 'order' ? 'bg-blue-500' :
                    item.type === 'payment' ? 'bg-green-500' :
                    item.type === 'session' ? 'bg-purple-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.event}</p>
                      <Badge variant="outline" className="text-xs">{item.restaurant}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RealtimePage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <RealtimePageContent />
    </ProtectedRoute>
  );
}

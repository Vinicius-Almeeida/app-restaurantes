/**
 * Waiter Dashboard Page
 * Main dashboard for waiter operations with real-time updates
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, LayoutGrid, Bell, Package } from 'lucide-react';
import { waiterApi } from '@/lib/api/waiter';
import { useWaiterSocket } from '@/lib/socket/useWaiterSocket';
import type { WaiterDashboardData } from '../types';
import {
  WaiterHeader,
  WaiterStats,
  TableGrid,
  ReadyOrdersList,
  WaiterCallsList,
} from '../components';

export default function WaiterDashboardPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.restaurantId as string;

  const [data, setData] = useState<WaiterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDashboard = useCallback(async (showRefreshMsg = false) => {
    if (!restaurantId) return;

    try {
      if (showRefreshMsg) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const dashboardData = await waiterApi.getDashboard(restaurantId);
      setData(dashboardData);

      if (showRefreshMsg) {
        toast.success('Dashboard atualizado');
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(), 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const { connected, reconnecting } = useWaiterSocket({
    restaurantId,
    onWaiterCalled: (payload) => {
      loadDashboard();
      toast.info('Nova chamada!', {
        description: `Mesa ${payload.tableNumber} está chamando`,
      });
    },
    onTableNeedsAttention: () => {
      loadDashboard();
    },
    enableNotifications: true,
    enableSounds: true,
  });

  const handleTableClick = (tableId: string) => {
    router.push(`/waiter/${restaurantId}/table/${tableId}`);
  };

  const handleDeliverOrder = async (orderId: string) => {
    try {
      setActionLoading(true);
      await waiterApi.deliverOrder(restaurantId, orderId);
      toast.success('Pedido entregue!');
      await loadDashboard();
    } catch (error) {
      console.error('Failed to deliver order:', error);
      toast.error('Erro ao marcar como entregue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcknowledgeCall = async (callId: string) => {
    try {
      setActionLoading(true);
      await waiterApi.acknowledgeCall(restaurantId, callId);
      toast.success('Chamada confirmada!');
      await loadDashboard();
    } catch (error) {
      console.error('Failed to acknowledge call:', error);
      toast.error('Erro ao confirmar chamada');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteCall = async (callId: string) => {
    try {
      setActionLoading(true);
      await waiterApi.completeCall(restaurantId, callId);
      toast.success('Chamada concluída!');
      await loadDashboard();
    } catch (error) {
      console.error('Failed to complete call:', error);
      toast.error('Erro ao concluir chamada');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/restaurant/login');
  };

  const handleNotificationsClick = () => {
    setActiveTab('calls');
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const notificationCount = (data.pendingCalls?.length || 0) + (data.readyOrders?.length || 0);
  const pendingCalls = Array.isArray(data.pendingCalls) ? data.pendingCalls : [];
  const readyOrders = Array.isArray(data.readyOrders) ? data.readyOrders : [];
  const tables = Array.isArray(data.tables) ? data.tables : [];

  return (
    <div className="min-h-screen bg-background">
      <WaiterHeader
        restaurantName="TabSync Restaurant"
        waiterName="Garçom"
        notificationCount={notificationCount}
        isConnected={connected}
        isReconnecting={reconnecting}
        onLogout={handleLogout}
        onRefresh={() => loadDashboard(true)}
        onNotificationsClick={handleNotificationsClick}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <WaiterStats stats={data.stats} />
        </div>

        <Separator className="mb-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutGrid className="size-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="calls" className="gap-2">
              <Bell className="size-4" />
              Chamadas
              {pendingCalls.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingCalls.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="gap-2">
              <Package className="size-4" />
              Entregas
              {readyOrders.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                  {readyOrders.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {pendingCalls.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Chamadas Urgentes</h2>
                <WaiterCallsList
                  calls={pendingCalls.slice(0, 3)}
                  onAcknowledge={handleAcknowledgeCall}
                  onComplete={handleCompleteCall}
                  isLoading={actionLoading}
                />
              </div>
            )}

            {readyOrders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Próximas Entregas</h2>
                <ReadyOrdersList
                  orders={readyOrders.slice(0, 4)}
                  onDeliver={handleDeliverOrder}
                  isLoading={actionLoading}
                />
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-3">Mesas</h2>
              <TableGrid tables={tables} onTableClick={handleTableClick} />
            </div>
          </TabsContent>

          <TabsContent value="calls">
            <WaiterCallsList
              calls={pendingCalls}
              onAcknowledge={handleAcknowledgeCall}
              onComplete={handleCompleteCall}
              isLoading={actionLoading}
            />
          </TabsContent>

          <TabsContent value="deliveries">
            <ReadyOrdersList
              orders={readyOrders}
              onDeliver={handleDeliverOrder}
              isLoading={actionLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

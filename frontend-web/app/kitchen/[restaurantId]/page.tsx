/**
 * Kitchen Dashboard Page
 * Real-time Kanban board for kitchen operations
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { kitchenApi } from '@/lib/api/kitchen';
import type { ActiveOrdersResponse } from '../types';
import { useKitchenSocket } from '@/lib/socket/useKitchenSocket';
import { KitchenHeader, KitchenStats, KanbanBoard } from '../components';
import { Loader2 } from 'lucide-react';

const EMPTY_DATA: ActiveOrdersResponse = {
  pending: [],
  confirmed: [],
  preparing: [],
  ready: [],
  stats: {
    ordersToday: 0,
    avgPrepTimeMinutes: 0,
    ordersPerHour: 0,
    pendingCount: 0,
    preparingCount: 0,
    readyCount: 0,
    deliveredToday: 0,
    cancelledToday: 0,
  },
};

export default function KitchenDashboardPage() {
  const params = useParams();
  const restaurantId = params?.restaurantId as string;

  const [data, setData] = useState<ActiveOrdersResponse>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async (showRefreshMsg = false) => {
    if (!restaurantId) return;

    try {
      if (showRefreshMsg) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await kitchenApi.getActiveOrders(restaurantId);
      setData(response);

      if (showRefreshMsg) {
        toast.success('Dashboard atualizado');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Erro ao carregar pedidos');
      setData(EMPTY_DATA);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const { connected, reconnecting } = useKitchenSocket({
    restaurantId,
    onOrderReceived: () => {
      fetchOrders();
      toast.info('Novo pedido recebido!');
    },
    onOrderStarted: () => {
      fetchOrders();
    },
    onOrderReady: () => {
      fetchOrders();
    },
    enableNotifications: true,
    enableSounds: true,
  });

  const handleConfirm = async (orderId: string) => {
    if (!restaurantId) return;

    try {
      setActionLoading(orderId);
      await kitchenApi.confirmOrder(restaurantId, orderId);
      toast.success('Pedido confirmado');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to confirm order:', error);
      toast.error('Erro ao confirmar pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (orderId: string) => {
    if (!restaurantId) return;

    try {
      setActionLoading(orderId);
      await kitchenApi.startOrder(restaurantId, orderId, { estimatedMinutes: 15 });
      toast.success('Pedido em preparo');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to start order:', error);
      toast.error('Erro ao iniciar pedido');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReady = async (orderId: string) => {
    if (!restaurantId) return;

    try {
      setActionLoading(orderId);
      await kitchenApi.markOrderReady(restaurantId, orderId);
      toast.success('Pedido marcado como pronto');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to mark order ready:', error);
      toast.error('Erro ao marcar pedido como pronto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!restaurantId) return;

    try {
      setActionLoading(orderId);
      await kitchenApi.cancelOrder(restaurantId, orderId, 'Cancelado pela cozinha');
      toast.success('Pedido cancelado');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Erro ao cancelar pedido');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading && !data.stats.ordersToday) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KitchenHeader
        restaurantName="TabSync Restaurant"
        isConnected={connected}
        isReconnecting={reconnecting}
        onRefresh={() => fetchOrders(true)}
        isRefreshing={isRefreshing}
      />

      <main className="container mx-auto px-6 py-6 space-y-6">
        <KitchenStats stats={data.stats} />

        <KanbanBoard
          data={data}
          onConfirm={handleConfirm}
          onStart={handleStart}
          onReady={handleReady}
          onCancel={handleCancel}
          isLoading={actionLoading !== null}
        />
      </main>
    </div>
  );
}

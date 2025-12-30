'use client';

import { ChefHat, Clock, Check, LogOut } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import { ORDER_STATUS_FLOW } from '../../constants';
import { OrderStatusBadge } from '../shared';
import type { OrderStatus } from '../../types';

export function KitchenDashboard() {
  const currentUser = useGastroStore((state) => state.currentUser);
  const orders = useGastroStore((state) => state.orders);
  const updateOrderStatus = useGastroStore((state) => state.updateOrderStatus);
  const logout = useGastroStore((state) => state.logout);

  const activeOrders = orders.filter(
    (order) => !['delivered', 'cancelled'].includes(order.status)
  );

  const pendingOrders = activeOrders.filter((o) => o.status === 'pending');
  const receivedOrders = activeOrders.filter((o) => o.status === 'received');
  const preparingOrders = activeOrders.filter((o) => o.status === 'preparing');
  const readyOrders = activeOrders.filter((o) => o.status === 'ready');

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusOrder: OrderStatus[] = ['pending', 'received', 'preparing', 'ready', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  const getNextStatusLabel = (currentStatus: OrderStatus): string => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return '';
    const statusInfo = ORDER_STATUS_FLOW.find((s) => s.key === nextStatus);
    return statusInfo?.label ?? '';
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="gastro-container staff-view">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChefHat size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600 }}>{currentUser?.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cozinha</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            style={{
              background: 'var(--bg-card-hover)',
              border: 'none',
              borderRadius: 12,
              padding: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingOrders.length}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3B82F6' }}>{receivedOrders.length}</div>
          <div className="stat-label">Recebidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8B5CF6' }}>{preparingOrders.length}</div>
          <div className="stat-label">Preparando</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{readyOrders.length}</div>
          <div className="stat-label">Prontos</div>
        </div>
      </div>

      {/* Orders List */}
      <div className="order-list">
        {activeOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            <ChefHat size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>Nenhum pedido no momento</p>
          </div>
        ) : (
          activeOrders
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <div
                  key={order.id}
                  className="order-card"
                  style={{
                    borderLeft: `4px solid ${
                      order.status === 'pending' ? '#F59E0B' :
                      order.status === 'received' ? '#3B82F6' :
                      order.status === 'preparing' ? '#8B5CF6' : '#10B981'
                    }`,
                  }}
                >
                  <div className="order-card-header">
                    <div>
                      <span className="order-number">Pedido #{order.number}</span>
                      <span className="order-table" style={{ marginLeft: 12 }}>Mesa {order.tableNumber}</span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Clock size={14} />
                    {formatTime(order.createdAt)}
                  </div>

                  <div className="order-items-list">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span>
                          {item.menuItem.image} <strong>{item.quantity}x</strong> {item.menuItem.name}
                        </span>
                        {item.notes && (
                          <span style={{ fontSize: 12, color: 'var(--warning)' }}>Obs: {item.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {nextStatus && (
                    <div className="order-actions">
                      <button
                        type="button"
                        className="action-btn action-btn-primary"
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                      >
                        <Check size={18} style={{ marginRight: 8 }} />
                        {getNextStatusLabel(order.status)}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

'use client';

import { Bell, Check, LogOut, User, Clock } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';

export function WaiterDashboard() {
  const currentUser = useGastroStore((state) => state.currentUser);
  const waiterCalls = useGastroStore((state) => state.waiterCalls);
  const orders = useGastroStore((state) => state.orders);
  const handleWaiterCall = useGastroStore((state) => state.handleWaiterCall);
  const logout = useGastroStore((state) => state.logout);

  const pendingCalls = waiterCalls.filter((call) => !call.handled);
  const readyOrders = orders.filter((order) => order.status === 'ready');

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
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600 }}>{currentUser?.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Garçom</p>
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
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingCalls.length}</div>
          <div className="stat-label">Chamados Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{readyOrders.length}</div>
          <div className="stat-label">Pedidos Prontos</div>
        </div>
      </div>

      {/* Pending Calls */}
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={20} />
          Chamados de Clientes
        </h2>

        {pendingCalls.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum chamado pendente
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingCalls.map((call) => (
              <div
                key={call.id}
                className="order-card"
                style={{ animation: 'pendingPulse 2s infinite' }}
              >
                <div className="order-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>
                      {call.reasonId === 'conta' ? '💳' :
                       call.reasonId === 'cardapio' ? '📋' :
                       call.reasonId === 'agua' ? '💧' :
                       call.reasonId === 'duvida' ? '❓' : '💬'}
                    </span>
                    <div>
                      <div className="order-number">Mesa {call.tableNumber}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{call.reasonLabel}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                    <Clock size={14} />
                    {formatTime(call.timestamp)}
                  </div>
                </div>
                <button
                  type="button"
                  className="action-btn action-btn-primary"
                  onClick={() => handleWaiterCall(call.id)}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  <Check size={18} style={{ marginRight: 8 }} />
                  Marcar como Atendido
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ready Orders */}
      {readyOrders.length > 0 && (
        <div style={{ padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Pedidos Prontos para Entrega
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {readyOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-number">Pedido #{order.number}</span>
                  <span className="order-table">Mesa {order.tableNumber}</span>
                </div>
                <div className="order-items-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <span>{item.menuItem.image} {item.quantity}x {item.menuItem.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

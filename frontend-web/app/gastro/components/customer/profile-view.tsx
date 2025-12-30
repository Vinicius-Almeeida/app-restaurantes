'use client';

import { User, LogOut, History, MapPin } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import { OrderStatusBadge } from '../shared';

export function ProfileView() {
  const currentUser = useGastroStore((state) => state.currentUser);
  const orders = useGastroStore((state) => state.orders);
  const logout = useGastroStore((state) => state.logout);

  const userOrders = orders
    .filter((order) => order.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="gastro-content" style={{ padding: 16 }}>
      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <User size={40} color="white" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{currentUser?.name}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{currentUser?.email}</p>
        {currentUser?.tableNumber && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'var(--bg-card-hover)',
              borderRadius: 20,
              fontSize: 14,
            }}
          >
            <MapPin size={14} />
            Mesa {currentUser.tableNumber}
          </div>
        )}
      </div>

      {/* Order History */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <History size={20} />
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Histórico de Pedidos</h3>
        </div>

        {userOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum pedido realizado
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {userOrders.map((order) => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>Pedido #{order.number}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={logout}
        className="btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <LogOut size={18} />
        Sair
      </button>
    </div>
  );
}

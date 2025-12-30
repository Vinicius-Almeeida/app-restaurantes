'use client';

import { Settings, DollarSign, Users, Package, LogOut, Eye, EyeOff } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import { OrderStatusBadge } from '../shared';

export function AdminDashboard() {
  const currentUser = useGastroStore((state) => state.currentUser);
  const orders = useGastroStore((state) => state.orders);
  const menuItems = useGastroStore((state) => state.menuItems);
  const restaurant = useGastroStore((state) => state.restaurant);
  const toggleItemAvailability = useGastroStore((state) => state.toggleItemAvailability);
  const logout = useGastroStore((state) => state.logout);

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const occupiedTables = restaurant.tables.filter((t) => t.status === 'occupied').length;

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
                background: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600 }}>Painel Administrativo</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{currentUser?.name}</p>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={20} color="var(--primary)" />
          </div>
          <div className="stat-value">{todayOrders.length}</div>
          <div className="stat-label">Pedidos Hoje</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <DollarSign size={20} color="var(--success)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: 24 }}>
            {formatPrice(todayRevenue)}
          </div>
          <div className="stat-label">Receita Hoje</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Users size={20} color="var(--warning)" />
          </div>
          <div className="stat-value">{occupiedTables}/{restaurant.tables.length}</div>
          <div className="stat-label">Mesas Ocupadas</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={20} color="var(--secondary)" />
          </div>
          <div className="stat-value">{menuItems.length}</div>
          <div className="stat-label">Itens no Menu</div>
        </div>
      </div>

      {/* Menu Management */}
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Gerenciar Cardápio</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: item.available ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{item.image}</span>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {formatPrice(item.price)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleItemAvailability(item.id)}
                aria-label={item.available ? 'Desabilitar item' : 'Habilitar item'}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: item.available ? 'var(--success)' : 'var(--danger)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                {item.available ? 'Disponível' : 'Indisponível'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Pedidos Recentes</h2>
        <div className="order-list" style={{ padding: 0 }}>
          {orders.slice(-10).reverse().map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-number">Pedido #{order.number}</span>
                  <span className="order-table" style={{ marginLeft: 12 }}>Mesa {order.tableNumber}</span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
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
      </div>
    </div>
  );
}

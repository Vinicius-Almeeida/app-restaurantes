'use client';

import { useGastroStore } from '../../stores/useGastroStore';
import { ORDER_STATUS_FLOW } from '../../constants';
import { OrderStatusBadge } from '../shared';

export function TrackingView() {
  const orders = useGastroStore((state) => state.orders);
  const currentUser = useGastroStore((state) => state.currentUser);

  const userOrders = orders
    .filter((order) => order.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const latestOrder = userOrders[0];

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (!latestOrder) {
    return (
      <div className="gastro-content" style={{ padding: 20 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 60,
            color: 'var(--text-muted)',
          }}
        >
          <h3 style={{ marginBottom: 8 }}>Nenhum pedido</h3>
          <p style={{ fontSize: 14 }}>Você ainda não fez nenhum pedido</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = ORDER_STATUS_FLOW.findIndex((s) => s.key === latestOrder.status);

  return (
    <div className="gastro-content" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Pedido #{latestOrder.number}</h2>
        <OrderStatusBadge status={latestOrder.status} />
      </div>

      {/* Timeline */}
      <div className="tracking-timeline">
        {ORDER_STATUS_FLOW.filter((s) => s.key !== 'cancelled').map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStatusIndex;
          const isActive = index === currentStatusIndex;

          return (
            <div
              key={step.key}
              className={`tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="tracking-step-icon">
                <Icon size={20} color={isCompleted || isActive ? 'white' : 'var(--text-muted)'} />
              </div>
              <div className="tracking-step-info">
                <h4 style={{ color: isCompleted || isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {step.label}
                </h4>
                <p>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Items */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Itens do Pedido</h3>
        {latestOrder.items.map((item) => (
          <div key={item.id} className="order-item-row">
            <div style={{ display: 'flex', gap: 8 }}>
              <span>{item.menuItem.image}</span>
              <span>
                {item.quantity}x {item.menuItem.name}
              </span>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span style={{ color: 'var(--secondary)' }}>{formatPrice(latestOrder.total)}</span>
        </div>
      </div>
    </div>
  );
}

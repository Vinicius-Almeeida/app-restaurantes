'use client';

import { ShoppingCart } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import { SERVICE_FEE_PERCENT } from '../../constants';
import { CartItemComponent } from '../shared';

export function CartView() {
  const cart = useGastroStore((state) => state.cart);
  const updateCartItem = useGastroStore((state) => state.updateCartItem);
  const removeFromCart = useGastroStore((state) => state.removeFromCart);
  const createOrder = useGastroStore((state) => state.createOrder);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const serviceFee = subtotal * SERVICE_FEE_PERCENT;
  const total = subtotal + serviceFee;

  const handleCreateOrder = () => {
    const order = createOrder();
    if (order) {
      // Order created, view will switch to tracking automatically
    }
  };

  if (cart.length === 0) {
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
          <ShoppingCart size={64} style={{ marginBottom: 16, opacity: 0.5 }} />
          <h3 style={{ marginBottom: 8 }}>Carrinho vazio</h3>
          <p style={{ fontSize: 14 }}>Adicione itens do cardápio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gastro-content" style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 600 }}>Seu Carrinho</h2>

      {/* Cart Items */}
      <div style={{ marginBottom: 24 }}>
        {cart.map((item) => (
          <CartItemComponent
            key={item.id}
            item={item}
            onUpdateQuantity={updateCartItem}
            onRemove={removeFromCart}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Taxa de Serviço (10%)</span>
          <span>{formatPrice(serviceFee)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <span>Total</span>
          <span style={{ color: 'var(--secondary)' }}>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Order Button */}
      <button type="button" className="btn-primary" onClick={handleCreateOrder}>
        Fazer Pedido
      </button>
    </div>
  );
}

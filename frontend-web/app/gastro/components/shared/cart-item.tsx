'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="cart-item">
      <span className="cart-item-emoji">{item.menuItem.image}</span>

      <div className="cart-item-info">
        <div className="cart-item-name">{item.menuItem.name}</div>
        <div className="cart-item-price">
          {formatPrice(item.menuItem.price)} cada
        </div>
        {item.notes && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Obs: {item.notes}
          </div>
        )}
      </div>

      <div className="cart-item-actions">
        <button
          type="button"
          className="quantity-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          aria-label="Diminuir quantidade"
        >
          <Minus size={16} />
        </button>

        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
          {item.quantity}
        </span>

        <button
          type="button"
          className="quantity-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          aria-label="Aumentar quantidade"
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="Remover item"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            background: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: 8,
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--secondary)' }}>
        {formatPrice(item.subtotal)}
      </div>
    </div>
  );
}

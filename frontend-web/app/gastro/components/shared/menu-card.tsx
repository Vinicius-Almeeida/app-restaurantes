'use client';

import { Star, Flame, Leaf, Plus } from 'lucide-react';
import type { MenuItem } from '../../types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div
      className="menu-item-card"
      style={{ opacity: item.available ? 1 : 0.5 }}
    >
      <div className="menu-item-image">{item.image}</div>

      <div className="menu-item-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          {item.isPopular && (
            <Flame size={14} color="#F59E0B" />
          )}
          {item.isVegan && (
            <Leaf size={14} color="#10B981" />
          )}
        </div>

        <h3 className="menu-item-name">{item.name}</h3>

        <p
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Star size={12} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {item.rating}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            • {item.prepTime}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="menu-item-price">{formatPrice(item.price)}</span>

          <button
            type="button"
            onClick={() => onAddToCart(item)}
            disabled={!item.available}
            aria-label={`Adicionar ${item.name} ao carrinho`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: item.available ? 'var(--secondary)' : 'var(--text-muted)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: item.available ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

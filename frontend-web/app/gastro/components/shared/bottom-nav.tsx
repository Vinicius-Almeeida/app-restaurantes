'use client';

import { Menu, ShoppingCart, Receipt, User } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';
import type { GastroView } from '../../types';

interface NavItem {
  view: GastroView;
  label: string;
  icon: typeof Menu;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'menu', label: 'Menu', icon: Menu },
  { view: 'cart', label: 'Carrinho', icon: ShoppingCart },
  { view: 'tracking', label: 'Pedidos', icon: Receipt },
  { view: 'profile', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const currentView = useGastroStore((state) => state.currentView);
  const setCurrentView = useGastroStore((state) => state.setCurrentView);
  const cart = useGastroStore((state) => state.cart);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.view;
        const showBadge = item.view === 'cart' && cartItemCount > 0;

        return (
          <button
            key={item.view}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentView(item.view)}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={24} />
              {showBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    background: 'var(--secondary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

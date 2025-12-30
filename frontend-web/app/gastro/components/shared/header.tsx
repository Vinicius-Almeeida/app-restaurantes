'use client';

import { LogOut } from 'lucide-react';
import { useGastroStore } from '../../stores/useGastroStore';

interface HeaderProps {
  showLogout?: boolean;
}

export function Header({ showLogout = true }: HeaderProps) {
  const restaurant = useGastroStore((state) => state.restaurant);
  const logout = useGastroStore((state) => state.logout);

  return (
    <header className="header">
      <div className="header-logo">
        <span className="text-2xl">{restaurant.logo}</span>
      </div>

      <h1 className="header-title">{restaurant.name}</h1>

      {showLogout && (
        <button
          onClick={logout}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      )}
    </header>
  );
}

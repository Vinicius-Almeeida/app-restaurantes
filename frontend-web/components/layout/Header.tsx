'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'RESTAURANT_OWNER':
        return 'Restaurante';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Cliente';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🍽️</span>
          <span className="text-xl font-bold text-orange-600">TabSync</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link
              href="/orders"
              className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              Meus Pedidos
            </Link>
          )}
          {isAuthenticated && user?.role === 'RESTAURANT_OWNER' && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/orders"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Pedidos
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 h-10 px-3 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user.fullName.split(' ')[0]}</span>
                  <span className="text-xs text-gray-500">{getRoleLabel(user.role)}</span>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[9999]">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-orange-600 mt-1">{getRoleLabel(user.role)}</p>
                  </div>

                  {user.role === 'RESTAURANT_OWNER' && (
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'CUSTOMER' && (
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Meus Pedidos
                    </Link>
                  )}

                  <div className="border-t border-gray-100 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

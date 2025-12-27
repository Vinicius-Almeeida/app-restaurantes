'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();

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
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.fullName.split(' ')[0]}</span>
                      <span className="text-xs text-gray-500">{getRoleLabel(user.role)}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs leading-none text-gray-500">{user.email}</p>
                      <p className="text-xs leading-none text-orange-600 mt-1">{getRoleLabel(user.role)}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'RESTAURANT_OWNER' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'CUSTOMER' && (
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Meus Pedidos</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    Sair da conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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

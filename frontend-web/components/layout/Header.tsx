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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🍽️</span>
          <span className="text-xl font-bold text-orange-600">TabSync</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {user?.role === 'CUSTOMER' && (
                <>
                  <Link
                    href="/restaurants"
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Restaurantes
                  </Link>
                  <Link
                    href="/orders"
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Meus Pedidos
                  </Link>
                </>
              )}
              {user?.role === 'RESTAURANT_OWNER' && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/menu"
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Cardápio
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Pedidos
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link
                href="/restaurants"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Restaurantes
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-700">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Determina a página de login correta baseada no contexto da rota
 */
function getLoginRedirectForPath(pathname: string): string {
  if (pathname.startsWith('/super-admin')) {
    return '/super-admin/login';
  }
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/waiter') ||
    pathname.startsWith('/kitchen')
  ) {
    return '/restaurant/login';
  }
  return '/login';
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Determina o redirect baseado no contexto se não foi especificado
  const effectiveRedirectTo = redirectTo || getLoginRedirectForPath(pathname);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(effectiveRedirectTo);
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, effectiveRedirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    return null;
  }

  return <>{children}</>;
}

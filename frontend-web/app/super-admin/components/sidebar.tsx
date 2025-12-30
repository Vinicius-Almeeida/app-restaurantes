'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  Receipt,
  Headphones,
  Settings,
  UserCog,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Restaurantes', href: '/super-admin/restaurants', icon: Store },
  { label: 'Usuários', href: '/super-admin/users', icon: Users },
  { label: 'Planos', href: '/super-admin/plans', icon: CreditCard },
  { label: 'Assinaturas', href: '/super-admin/subscriptions', icon: Receipt },
  { label: 'Consultores', href: '/super-admin/consultants', icon: UserCog },
  { label: 'Suporte', href: '/super-admin/support', icon: Headphones },
  { label: 'Configurações', href: '/super-admin/settings', icon: Settings },
];

interface SuperAdminSidebarProps {
  onLogout?: () => void;
}

/**
 * SuperAdminSidebar Component
 *
 * Navigation sidebar for Super Admin dashboard.
 * Shows all admin sections with active state highlighting.
 *
 * Features:
 * - Active route highlighting
 * - Lucide React icons
 * - Logout button at bottom
 * - Responsive design
 *
 * @example
 * <SuperAdminSidebar onLogout={handleLogout} />
 */
export function SuperAdminSidebar({ onLogout }: SuperAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-600">TabSync</h1>
        <p className="text-xs text-gray-500 mt-1">Super Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'hover:bg-gray-100',
                isActive
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-700'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
}

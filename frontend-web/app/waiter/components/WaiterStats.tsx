/**
 * Waiter Stats Component
 * Mini statistics cards for quick dashboard overview
 */

'use client';

import { Card } from '@/components/ui/card';
import { Users, AlertCircle, Package, CheckCircle } from 'lucide-react';
import type { WaiterStats as WaiterStatsType } from '../types';

interface WaiterStatsProps {
  stats: WaiterStatsType;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'info';
}

function StatCard({ label, value, icon, variant = 'default' }: StatCardProps): JSX.Element {
  const variantClasses = {
    default: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    success: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    info: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  };

  return (
    <Card className="p-4 flex items-center gap-3 shadow-sm border-l-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

export function WaiterStats({ stats }: WaiterStatsProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Mesas Ativas"
        value={`${stats.activeTables}/${stats.totalTables}`}
        icon={<Users className="w-5 h-5" />}
        variant="info"
      />

      <StatCard
        label="Chamadas"
        value={stats.pendingCalls}
        icon={<AlertCircle className="w-5 h-5" />}
        variant={stats.pendingCalls > 0 ? 'warning' : 'default'}
      />

      <StatCard
        label="Pedidos Prontos"
        value={stats.readyOrders}
        icon={<Package className="w-5 h-5" />}
        variant={stats.readyOrders > 0 ? 'warning' : 'default'}
      />

      <StatCard
        label="Entregas Hoje"
        value={stats.deliveredToday}
        icon={<CheckCircle className="w-5 h-5" />}
        variant="success"
      />
    </div>
  );
}

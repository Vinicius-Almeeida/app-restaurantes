/**
 * Kitchen Stats Component
 * Displays key metrics and statistics for kitchen operations
 */

'use client';

import { Card } from '@/components/ui/card';
import type { KitchenStats as KitchenStatsType } from '../types';
import { Clock, CheckCircle2, TrendingUp, AlertCircle, ChefHat, XCircle } from 'lucide-react';

interface KitchenStatsProps {
  stats: KitchenStatsType;
}

export function KitchenStats({ stats }: KitchenStatsProps) {
  const statCards = [
    {
      label: 'Pedidos Hoje',
      value: stats.ordersToday,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Tempo Médio',
      value: `${stats.avgPrepTimeMinutes}min`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Entregues',
      value: stats.deliveredToday,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Pendentes',
      value: stats.pendingCount,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      label: 'Em Preparo',
      value: stats.preparingCount,
      icon: ChefHat,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Cancelados',
      value: stats.cancelledToday,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={`${stat.bgColor} border-2 ${stat.borderColor} p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.bgColor} p-2 rounded-lg border ${stat.borderColor}`}>
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color} truncate`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

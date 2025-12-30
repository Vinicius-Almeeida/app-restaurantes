/**
 * Priority Badge Component
 * Displays order priority with appropriate color coding
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, ArrowDown, Signal } from 'lucide-react';
import type { OrderPriority } from '../types';

interface PriorityBadgeProps {
  priority: OrderPriority;
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showIcon = true, className }: PriorityBadgeProps) {
  const config = {
    LOW: {
      label: 'Baixa',
      icon: ArrowDown,
      className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    },
    NORMAL: {
      label: 'Normal',
      icon: Signal,
      className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    },
    HIGH: {
      label: 'Alta',
      icon: AlertTriangle,
      className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
    },
    URGENT: {
      label: 'Urgente',
      icon: AlertCircle,
      className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 animate-pulse',
    },
  };

  const { label, icon: Icon, className: priorityClassName } = config[priority];

  return (
    <Badge className={`${priorityClassName} ${className || ''}`} aria-label={`Prioridade: ${label}`}>
      {showIcon && <Icon className="size-3" />}
      {label}
    </Badge>
  );
}

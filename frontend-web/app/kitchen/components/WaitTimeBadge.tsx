/**
 * Wait Time Badge Component
 * Shows how long the order has been waiting with color-coded urgency
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WaitTimeBadgeProps {
  createdAt: string;
  className?: string;
}

export function WaitTimeBadge({ createdAt, className }: WaitTimeBadgeProps) {
  const [minutesWaiting, setMinutesWaiting] = useState(0);

  useEffect(() => {
    const calculateWaitTime = () => {
      const now = new Date();
      const created = new Date(createdAt);
      const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
      setMinutesWaiting(diff);
    };

    calculateWaitTime();
    const interval = setInterval(calculateWaitTime, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [createdAt]);

  const getUrgencyConfig = (minutes: number) => {
    if (minutes < 10) {
      return {
        label: `${minutes}min`,
        className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      };
    } else if (minutes < 20) {
      return {
        label: `${minutes}min`,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      };
    } else if (minutes < 30) {
      return {
        label: `${minutes}min`,
        className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      };
    } else {
      return {
        label: `${minutes}min`,
        className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 animate-pulse',
      };
    }
  };

  const { label, className: urgencyClassName } = getUrgencyConfig(minutesWaiting);

  return (
    <Badge className={`${urgencyClassName} ${className || ''}`} aria-label={`Tempo de espera: ${label}`}>
      <Clock className="size-3" />
      {label}
    </Badge>
  );
}

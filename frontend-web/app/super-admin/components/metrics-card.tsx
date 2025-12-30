import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * MetricsCard Component
 *
 * Displays key metrics with icon, value, optional trend and description.
 * Used in Super Admin dashboard for MRR, ARR, GMV, etc.
 *
 * @example
 * <MetricsCard
 *   title="MRR"
 *   value="R$ 45.230,00"
 *   icon={DollarSign}
 *   trend={{ value: 12.5, isPositive: true }}
 * />
 */
export function MetricsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = '',
}: MetricsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-500">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

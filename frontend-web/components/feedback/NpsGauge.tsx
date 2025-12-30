/**
 * NPS Gauge Component
 * Circular gauge visualization for NPS score
 */

'use client';

import { cn } from '@/lib/utils';

interface NpsGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { size: 120, stroke: 8, fontSize: 'text-2xl' },
  md: { size: 160, stroke: 12, fontSize: 'text-3xl' },
  lg: { size: 200, stroke: 16, fontSize: 'text-4xl' },
};

export function NpsGauge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: NpsGaugeProps) {
  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * Math.PI;
  const normalizedScore = (score + 100) / 200;
  const offset = circumference - normalizedScore * circumference;

  const getColor = (npsScore: number): string => {
    if (npsScore < 0) return '#ef4444';
    if (npsScore < 30) return '#f59e0b';
    if (npsScore < 50) return '#eab308';
    if (npsScore < 70) return '#84cc16';
    return '#22c55e';
  };

  const getLabel = (npsScore: number): string => {
    if (npsScore < 0) return 'Precisa melhorar';
    if (npsScore < 30) return 'Bom';
    if (npsScore < 50) return 'Ótimo';
    if (npsScore < 70) return 'Excelente';
    return 'World Class';
  };

  const color = getColor(score);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.stroke}
            strokeDasharray={`${circumference} ${circumference}`}
          />
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', config.fontSize)} style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">NPS</span>
        </div>
      </div>

      {showLabel && (
        <p className="text-sm font-medium" style={{ color }}>
          {getLabel(score)}
        </p>
      )}
    </div>
  );
}

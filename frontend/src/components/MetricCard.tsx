import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  accentColor?: 'cyan' | 'red' | 'amber' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  change,
  changeType = 'neutral',
  icon: Icon,
  accentColor = 'cyan'
}) => {
  const colorMap = {
    cyan: 'text-primary border-primary/30 bg-primary/10',
    red: 'text-error border-error/30 bg-error/10',
    amber: 'text-tertiary border-tertiary/30 bg-tertiary/10',
    purple: 'text-secondary border-secondary/30 bg-secondary/10',
  };

  return (
    <div className="glass-panel p-5 rounded-lg border border-outline-variant/30 hover:border-primary/40 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono tracking-wider uppercase text-on-surface-variant font-medium">
          {title}
        </span>
        <div className={`p-2 rounded border ${colorMap[accentColor]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold font-mono tracking-tight text-on-surface">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
              changeType === 'negative'
                ? 'bg-error/20 text-error'
                : changeType === 'positive'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-on-surface-variant/80 mt-2 font-mono">
          {subtext}
        </p>
      )}
    </div>
  );
};

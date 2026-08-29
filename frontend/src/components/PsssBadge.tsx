import React from 'react';
import type { SeverityLevel } from '../types';

interface PsssBadgeProps {
  score: number;
  severity?: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const PsssBadge: React.FC<PsssBadgeProps> = ({ score, severity, size = 'md' }) => {
  const getSeverityColor = (s: number, sev?: SeverityLevel) => {
    if (sev === 'CRITICAL' || s >= 9.0) {
      return 'bg-error-container/40 text-error border-error/50 shadow-glow-red';
    }
    if (sev === 'HIGH' || s >= 7.5) {
      return 'bg-tertiary-container/30 text-tertiary border-tertiary/50 shadow-glow-amber';
    }
    if (sev === 'MEDIUM' || s >= 5.0) {
      return 'bg-primary/20 text-primary-bright border-primary/50 shadow-glow-cyan';
    }
    return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs tracking-wider',
    md: 'px-2.5 py-1 text-xs tracking-wider font-semibold',
    lg: 'px-3.5 py-1.5 text-sm tracking-widest font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono border ${sizeClasses[size]} ${getSeverityColor(score, severity)} transition-all duration-300`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{score.toFixed(1)} PSSS</span>
    </span>
  );
};

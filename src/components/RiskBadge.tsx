import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-400 border-red-500/40 shadow-red-950/40 shadow-inner';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'LOW':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    switch (level) {
      case 'CRITICAL':
        return <Flame size={iconSize} className="animate-pulse text-red-400" />;
      case 'HIGH':
        return <AlertOctagon size={iconSize} className="text-orange-400" />;
      case 'MODERATE':
        return <AlertTriangle size={iconSize} className="text-amber-400" />;
      case 'LOW':
      default:
        return <ShieldCheck size={iconSize} className="text-emerald-400" />;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold rounded-lg gap-2',
  };

  return (
    <span
      id={`risk-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center border tracking-wider uppercase font-mono ${getBadgeStyle()} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && getIcon()}
      <span>{level} RISK</span>
    </span>
  );
};

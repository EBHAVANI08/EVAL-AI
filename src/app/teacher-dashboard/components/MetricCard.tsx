import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';

interface MetricCardProps {
  id: string;
  variant: 'hero-alert' | 'positive' | 'negative' | 'warning' | 'neutral';
  label: string;
  value: string;
  subValue?: string;
  delta?: { value: string; direction: 'positive' | 'negative' | 'neutral' };
  description: string;
  colSpan?: number;
  ctaLabel?: string;
  ctaHref?: string;
}

const variantStyles = {
  'hero-alert': {
    card: 'bg-negative-bg border-2 border-negative/30',
    label: 'text-red-700',
    value: 'text-negative',
    icon: <AlertTriangle size={18} className="text-negative" />,
    iconBg: 'bg-negative/10',
  },
  positive: {
    card: 'bg-card border border-border',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    icon: <TrendingUp size={18} className="text-positive" />,
    iconBg: 'bg-positive-bg',
  },
  negative: {
    card: 'bg-negative-bg border border-negative/20',
    label: 'text-red-700',
    value: 'text-negative',
    icon: <TrendingDown size={18} className="text-negative" />,
    iconBg: 'bg-negative/10',
  },
  warning: {
    card: 'bg-warning-bg border border-warning/30',
    label: 'text-amber-700',
    value: 'text-amber-800',
    icon: <AlertTriangle size={18} className="text-warning" />,
    iconBg: 'bg-warning/10',
  },
  neutral: {
    card: 'bg-card border border-border',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    icon: null,
    iconBg: 'bg-muted',
  },
};

export default function MetricCard({
  id,
  variant,
  label,
  value,
  subValue,
  delta,
  description,
  colSpan,
  ctaLabel,
  ctaHref,
}: MetricCardProps) {
  const styles = variantStyles[variant];
  const isHero = variant === 'hero-alert';

  return (
    <div
      className={`rounded-2xl p-5 card-hover shadow-card ${styles.card} ${colSpan === 2 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          {styles.icon}
        </div>
        {delta && (
          <div className={`flex items-center gap-1 text-xs font-600 ${
            delta.direction === 'positive' ? 'text-positive' :
            delta.direction === 'negative'? 'text-negative' : 'text-muted-foreground'
          }`}>
            {delta.direction === 'positive' ? <TrendingUp size={12} /> : delta.direction === 'negative' ? <TrendingDown size={12} /> : null}
            {delta.value}
          </div>
        )}
      </div>

      <div className="mb-1">
        <p className={`metric-label ${styles.label}`}>{label}</p>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className={`${isHero ? 'metric-hero' : 'metric-large'} ${styles.value}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-sm font-600 text-negative mb-1">{subValue}</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-3 inline-flex items-center gap-1 text-xs font-700 text-negative hover:underline"
        >
          {ctaLabel}
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
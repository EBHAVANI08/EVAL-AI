'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';

/* ── Animated number counter ────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20, mass: 0.8 });
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

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
  index?: number; // for stagger
}

const variantConfig = {
  'hero-alert': {
    card: 'bg-white border border-negative/20',
    iconGradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    iconShadow: '0 4px 12px rgba(239,68,68,0.30)',
    label: 'text-red-600',
    value: 'text-red-600',
    accent: '#EF4444',
    topBar: 'from-red-400 to-red-600',
    icon: AlertTriangle,
  },
  positive: {
    card: 'bg-white border border-border',
    iconGradient: 'linear-gradient(135deg, #10B981, #059669)',
    iconShadow: '0 4px 12px rgba(16,185,129,0.28)',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    accent: '#10B981',
    topBar: 'from-emerald-400 to-emerald-600',
    icon: TrendingUp,
  },
  negative: {
    card: 'bg-white border border-negative/15',
    iconGradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    iconShadow: '0 4px 12px rgba(239,68,68,0.25)',
    label: 'text-red-600',
    value: 'text-negative',
    accent: '#EF4444',
    topBar: 'from-red-400 to-red-600',
    icon: TrendingDown,
  },
  warning: {
    card: 'bg-white border border-warning/20',
    iconGradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    iconShadow: '0 4px 12px rgba(245,158,11,0.28)',
    label: 'text-amber-700',
    value: 'text-amber-800',
    accent: '#F59E0B',
    topBar: 'from-amber-400 to-amber-600',
    icon: AlertTriangle,
  },
  neutral: {
    card: 'bg-white border border-border',
    iconGradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    iconShadow: '0 4px 12px rgba(79,70,229,0.25)',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    accent: '#4F46E5',
    topBar: 'from-indigo-400 to-purple-500',
    icon: TrendingUp,
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
  index = 0,
}: MetricCardProps) {
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;
  const isHero = variant === 'hero-alert';

  // Try to extract a numeric value for animation
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const canAnimate = !isNaN(numericValue) && isFinite(numericValue) && value !== '—';
  const suffix = value.includes('%') ? '%' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] ${cfg.card} ${colSpan === 2 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
      style={{ willChange: 'transform' }}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-70 ${cfg.topBar}`} />

      <div className="p-5">
        {/* Icon + delta row */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.35, ease: 'backOut' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: cfg.iconGradient,
              boxShadow: cfg.iconShadow,
            }}
          >
            <Icon size={18} className="text-white" />
          </motion.div>

          {delta && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 + 0.25, duration: 0.3 }}
              className={`flex items-center gap-1 text-xs font-600 px-2 py-1 rounded-lg ${
                delta.direction === 'positive'
                  ? 'text-positive bg-positive-bg'
                  : delta.direction === 'negative'
                  ? 'text-negative bg-negative-bg'
                  : 'text-muted-foreground bg-muted'
              }`}
            >
              {delta.direction === 'positive' ? <TrendingUp size={10} /> : delta.direction === 'negative' ? <TrendingDown size={10} /> : null}
              {delta.value}
            </motion.div>
          )}
        </div>

        {/* Label */}
        <p className={`metric-label mb-1.5 ${cfg.label}`}>{label}</p>

        {/* Value */}
        <div className="flex items-end gap-2 mb-2">
          <span className={`${isHero ? 'metric-hero' : 'metric-large'} ${cfg.value} font-tabular`}>
            {canAnimate ? (
              <AnimatedNumber value={numericValue} suffix={suffix} />
            ) : (
              value
            )}
          </span>
          {subValue && (
            <span className="text-sm font-600 text-negative mb-1 leading-none">{subValue}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

        {/* CTA */}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-3 inline-flex items-center gap-1 text-xs font-700 hover:gap-2 transition-all"
            style={{ color: cfg.accent }}
          >
            {ctaLabel}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* Subtle inner glow at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-[0.04]"
        style={{ background: `linear-gradient(to top, ${cfg.accent}, transparent)` }}
      />
    </motion.div>
  );
}

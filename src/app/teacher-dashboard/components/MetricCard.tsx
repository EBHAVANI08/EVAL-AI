'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

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
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    labelColor: 'text-red-700',
    accent: '#EF4444',
    icon: AlertTriangle,
  },
  positive: {
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600',
    labelColor: 'text-green-700',
    accent: '#10B981',
    icon: TrendingUp,
  },
  negative: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    labelColor: 'text-red-700',
    accent: '#EF4444',
    icon: TrendingDown,
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    labelColor: 'text-amber-700',
    accent: '#F59E0B',
    icon: AlertTriangle,
  },
  neutral: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    labelColor: 'text-blue-700',
    accent: '#1A6BFF',
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

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const canAnimate = !isNaN(numericValue) && isFinite(numericValue) && value !== '—';
  const suffix = value.includes('%') ? '%' : '';

  return (
    <GlassCard 
      delay={index * 0.05} 
      className={`p-5 ${colSpan === 2 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shadow-inner`}>
          <Icon size={20} className={cfg.iconColor} />
        </div>
        {delta && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${
            delta.direction === 'positive' ? 'text-green-600 bg-green-50' : 
            delta.direction === 'negative' ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50'
          }`}>
            {delta.direction === 'positive' && <TrendingUp size={10} />}
            {delta.direction === 'negative' && <TrendingDown size={10} />}
            {delta.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`${isHero ? 'text-3xl' : 'text-2xl'} font-black text-[#0A0F1E] tracking-tight`}>
            {canAnimate ? <AnimatedNumber value={numericValue} suffix={suffix} /> : value}
          </h3>
          {subValue && (
            <span className="text-[11px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
              {subValue}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-[#64748B] line-clamp-1">{description}</p>
      </div>

      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#1A6BFF] hover:gap-2 transition-all">
          {ctaLabel} <ArrowRight size={12} />
        </Link>
      )}

      {isHero && (
        <div className="absolute top-2 right-2">
          <Sparkles size={14} className="text-orange-300 animate-pulse" />
        </div>
      )}
    </GlassCard>
  );
}

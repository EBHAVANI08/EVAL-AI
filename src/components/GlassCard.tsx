'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverGlow?: boolean;
}

export default function GlassCard({ children, className = '', delay = 0, hoverGlow = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={hoverGlow ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`relative glass-premium rounded-3xl p-6 transition-all duration-300 ${
        hoverGlow ? 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-orange-500/20' : ''
      } ${className}`}
    >
      {hoverGlow && (
        <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-orange-500/5 blur-[100px]" />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

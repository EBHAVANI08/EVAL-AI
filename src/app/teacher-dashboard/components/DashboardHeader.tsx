'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Plus, Upload, Lightbulb, RefreshCw, Sparkles, CalendarDays } from 'lucide-react';

function useGreeting(name: string) {
  return useMemo(() => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    return { greeting, name: name.split(' ')[0], today };
  }, [name]);
}

export default function DashboardHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Teacher';
  const { greeting, name, today } = useGreeting(userName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mb-7"
    >
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden mb-5 bg-gradient-to-r from-primary via-indigo-600 to-violet-600 px-6 py-5 shadow-[var(--shadow-md)]">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-indigo-400/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* Greeting */}
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-medium">{greeting}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {name}!
            </h1>
            {/* Date */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <CalendarDays size={13} className="text-white/50" />
              <span className="text-white/60 text-xs">{today}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Upload size={13} />
              Upload
            </button>
            <button className="h-9 px-3.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/30 text-cyan-100 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Lightbulb size={13} />
              Generate
            </button>
            <Link
              href="/answer-sheet-evaluator"
              className="h-9 px-4 rounded-xl bg-white text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-white/90 transition-colors shadow-sm"
            >
              <Plus size={14} />
              New Evaluation
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import AppLogo from '@/components/ui/AppLogo';

interface AppLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white/80 backdrop-blur-md border-b border-border shrink-0 z-20"
        >
          <motion.button
            onClick={() => setMobileSidebarOpen(true)}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-foreground" />
          </motion.button>
          <AppLogo size={26} />
          <div className="flex flex-col">
            <span className="font-700 text-sm text-foreground leading-tight tracking-tight">Eval AI</span>
            <span className="text-[11px] text-orange-500 font-600">Teacher Portal</span>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto scrollbar-thin min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

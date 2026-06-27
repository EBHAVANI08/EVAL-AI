'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, CheckCircle, Users, BarChart3, Presentation, ClipboardList } from 'lucide-react';

const features = [
  {
    id: 'question-paper-generator',
    title: 'Question Paper Generator',
    description: 'AI-powered generation with 100% academic alignment.',
    icon: FileText,
    color: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    href: '/question-paper-generator',
  },
  {
    id: 'paper-evaluation',
    title: 'Paper Evaluation',
    description: 'Auto-grade subjective answers instantly using Vision AI.',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-400',
    bgLight: 'bg-green-500/10',
    iconColor: 'text-green-500',
    href: '/answer-sheet-evaluator',
  },
  {
    id: 'student-data',
    title: 'Student Data (wrt Grade)',
    description: 'Track individual performance and mastery by class.',
    icon: Users,
    color: 'from-purple-500 to-fuchsia-400',
    bgLight: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    href: '#',
  },
  {
    id: 'substituted-data',
    title: 'Substituted Data',
    description: 'Manage coverage and substitute teacher analytics.',
    icon: Presentation,
    color: 'from-orange-500 to-amber-400',
    bgLight: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    href: '#',
  },
  {
    id: 'score-card',
    title: 'Score Card Generation',
    description: 'Generate dynamic term scorecards for students.',
    icon: ClipboardList,
    color: 'from-pink-500 to-rose-400',
    bgLight: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
    href: '#',
  },
  {
    id: 'test-generator',
    title: 'Quick Test Generator',
    description: 'Create rapid 10-minute pop quizzes for daily assessment.',
    icon: BarChart3,
    color: 'from-indigo-500 to-violet-400',
    bgLight: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
    href: '#',
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function QuickAccessFeatures() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-900 text-foreground">Quick Access Tools</h2>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {features.map((feature) => (
          <Link key={feature.id} href={feature.href}>
            <motion.div 
              variants={item}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-5 rounded-3xl bg-white border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group h-full flex flex-col"
            >
              {/* Animated Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
              
              <div className="flex items-start gap-4 z-10 relative">
                <div className={`w-12 h-12 rounded-2xl ${feature.bgLight} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ease-out shadow-sm`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                
                <div>
                  <h3 className="text-[15px] font-800 text-foreground mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* Decorative line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} transition-all duration-500 ease-out`} />
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Database, KeyRound, Globe, Copy, Check, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function IntegrationsSection() {
  const [showGemini, setShowGemini] = useState(false);
  const [showMongo, setShowMongo] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 1500);
  };

  const integrations = [
    {
      key: 'gemini',
      name: 'Google Gemini AI',
      desc: 'Powers OCR, answer evaluation, semantic similarity, and key point extraction. All AI evaluation uses Gemini Vision.',
      icon: Brain,
      color: '#1A6BFF',
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
      status: 'connected',
      fields: [{ label: 'API Key', envVar: 'GEMINI_API_KEY', masked: true, showState: showGemini, toggleShow: () => setShowGemini(v => !v), value: '••••••••••••••••••••' }],
    },
    {
      key: 'mongodb',
      name: 'MongoDB Atlas',
      desc: 'Stores all evaluations, student data, question papers, settings, and user credentials. Primary database.',
      icon: Database,
      color: '#059669',
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      status: 'connected',
      fields: [
        { label: 'Connection String', envVar: 'MONGODB_URI', masked: true, showState: showMongo, toggleShow: () => setShowMongo(v => !v), value: '••••••••••••••••••••••••••••••' },
        { label: 'Database Name', envVar: 'MONGODB_DB', masked: false, showState: true, toggleShow: () => {}, value: process.env.NEXT_PUBLIC_MONGODB_DB || 'scanai' },
      ],
    },
    {
      key: 'google-oauth',
      name: 'Google OAuth',
      desc: 'Enables teachers and students to sign in with their Google account. Configured via Google Cloud Console.',
      icon: Globe,
      color: '#F59E0B',
      bg: 'from-amber-50 to-yellow-50',
      border: 'border-amber-100',
      status: 'connected',
      fields: [
        { label: 'Client ID', envVar: 'GOOGLE_CLIENT_ID', masked: false, showState: true, toggleShow: () => {}, value: 'Configured via environment' },
        { label: 'Callback URL', envVar: '', masked: false, showState: true, toggleShow: () => {}, value: '/api/auth/callback/google' },
      ],
    },
    {
      key: 'nextauth',
      name: 'NextAuth.js',
      desc: 'Manages authentication sessions, JWT tokens, and role-based access control for teachers, students, and admins.',
      icon: KeyRound,
      color: '#7C3AED',
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-100',
      status: 'connected',
      fields: [
        { label: 'Auth Strategy', envVar: '', masked: false, showState: true, toggleShow: () => {}, value: 'JWT (credentials + Google OAuth)' },
        { label: 'Session Duration', envVar: '', masked: false, showState: true, toggleShow: () => {}, value: '30 days' },
      ],
    },
  ];

  return (
    <motion.div key="integrations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Integrations</h2>
        <p className="text-[#64748B] font-bold mt-1">Services and APIs connected to the platform</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {integrations.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className={`bg-gradient-to-br ${item.bg} border ${item.border}`}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-white/60">
                      <Icon size={22} style={{ color: item.color }} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#0A0F1E] text-base">{item.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Connected</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-green-100 border border-green-200 text-[10px] font-black text-green-700 uppercase tracking-wider">Active</span>
                </div>

                <p className="text-sm font-medium text-[#64748B] leading-relaxed mb-5">{item.desc}</p>

                <div className="space-y-3">
                  {item.fields.map((field) => (
                    <div key={field.label} className="bg-white/70 rounded-xl border border-white/60 px-4 py-3">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">{field.label}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-[#0A0F1E] flex-1 truncate font-mono">
                          {field.masked && !field.showState ? field.value : field.value}
                        </code>
                        {field.masked && (
                          <button onClick={field.toggleShow} className="text-[#94A3B8] hover:text-[#0A0F1E] transition-colors">
                            {field.showState ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                        {field.envVar && (
                          <button onClick={() => copy(field.envVar, field.envVar)} className="text-[#94A3B8] hover:text-[#0A0F1E] transition-colors">
                            {copied === field.envVar ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                      {field.envVar && <p className="text-[10px] font-bold text-[#94A3B8] mt-1">Env: <code className="text-[#7C3AED]">{field.envVar}</code></p>}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Setup guide */}
      <GlassCard className="bg-gradient-to-br from-[#0A0F1E] to-[#1E293B] border-none text-white">
        <h3 className="font-black text-white text-lg mb-3">Environment Variables Reference</h3>
        <p className="text-sm text-white/60 font-medium mb-5">All required variables for production deployment on Render or Vercel</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['GEMINI_API_KEY', 'MONGODB_URI', 'MONGODB_DB', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'AUTH_TRUST_HOST'].map(key => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group">
              <code className="text-xs font-bold text-[#CCFF00] font-mono">{key}</code>
              <button onClick={() => copy(key, 'env_' + key)} className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all">
                {copied === 'env_' + key ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

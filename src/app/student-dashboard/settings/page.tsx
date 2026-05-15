'use client';

import React, { useState } from 'react';
import { Bell, Lock, User, Shield, Check, Sparkles, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, results: true, announcements: false });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${
        active ? 'bg-orange-500 shadow-orange-200' : 'bg-[#E2E8F5]'
      }`}
    >
      <motion.div
        animate={{ x: active ? 30 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg flex items-center justify-center"
      >
        {active && <Check size={10} className="text-orange-600 font-black" />}
      </motion.div>
    </button>
  );

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tight">Settings</h2>
          <p className="text-sm text-[#64748B] font-medium mt-1">Manage your account security and notification preferences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-orange-600 text-white font-black shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Save size={18} />
            </motion.div>
          ) : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Account */}
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
              <User size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Account Profile</h3>
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Primary Information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Display Name', value: 'Student Name', icon: User },
              { label: 'Email Address', value: 'student@school.edu', icon: Bell },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-2 ml-1">{field.label}</label>
                <div className="relative group">
                  <input
                    defaultValue={field.value}
                    className="w-full text-base font-bold text-[#0A0F1E] bg-[#F8FAFF] border border-[#E2E8F5] rounded-2xl px-5 py-3.5 focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={16} className="text-orange-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard delay={0.2}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
              <Bell size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Notification Preferences</h3>
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Control your alerts</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'email' as const, label: 'Email Notifications', desc: 'Get automated updates sent to your inbox' },
              { key: 'results' as const, label: 'Result Alerts', desc: 'Instant push notifications when results are published' },
              { key: 'announcements' as const, label: 'Announcements', desc: 'Important school-wide news and updates' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-[#F8FAFF] border border-[#E2E8F5]/50 hover:border-orange-200/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${notifications[item.key] ? 'bg-orange-100/50' : 'bg-gray-100'}`}>
                    <Bell size={18} className={notifications[item.key] ? 'text-orange-600' : 'text-[#94A3B8]'} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#0A0F1E] group-hover:text-orange-600 transition-colors">{item.label}</p>
                    <p className="text-sm font-medium text-[#64748B]">{item.desc}</p>
                  </div>
                </div>
                <Toggle 
                  active={notifications[item.key]} 
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} 
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard delay={0.3}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner">
              <Shield size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Security & Privacy</h3>
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Keep your account safe</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Current Password', placeholder: '••••••••' },
              { label: 'New Password', placeholder: '••••••••' },
              { label: 'Confirm Password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-2 ml-1">{field.label}</label>
                <input
                  type="password"
                  placeholder={field.placeholder}
                  className="w-full text-base font-bold text-[#0A0F1E] bg-[#F8FAFF] border border-[#E2E8F5] rounded-2xl px-5 py-3.5 focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/5 transition-all outline-none"
                />
              </div>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 w-full md:w-auto px-10 py-4 bg-[#0A0F1E] hover:bg-green-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group"
          >
            <Lock size={18} className="group-hover:rotate-12 transition-transform" />
            Update Security Credentials
          </motion.button>
        </GlassCard>
      </div>
    </div>
  );
}

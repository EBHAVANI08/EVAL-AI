'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, Clock, Info, AlertCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  unread: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Evaluation Complete', description: 'AI has finished grading Mathematics Unit 1.', time: '2 mins ago', type: 'success', unread: true },
  { id: '2', title: 'System Maintenance', description: 'Scheduled maintenance today at 11 PM.', time: '1 hour ago', type: 'info', unread: true },
  { id: '3', title: 'Low Confidence Alert', description: 'Question #4 in Physics exam needs review.', time: '3 hours ago', type: 'warning', unread: false },
];

export default function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 mt-3 w-[400px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] border border-[#E8EFFE] overflow-hidden z-[70]"
          >
            <div className="px-8 py-6 bg-gradient-to-br from-[#F8FAFF] to-white border-b border-[#E8EFFE] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#0A0F1E]">Notifications</h3>
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-1">
                  {mockNotifications.filter(n => n.unread).length} Unread Alerts
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#94A3B8] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[450px] overflow-y-auto scrollbar-thin">
              {mockNotifications.length > 0 ? (
                <div className="divide-y divide-[#F1F5F9]">
                  {mockNotifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`px-8 py-6 hover:bg-[#F8FAFF] transition-all cursor-pointer group relative ${n.unread ? 'bg-white' : 'bg-white/50'}`}
                    >
                      {n.unread && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                      )}
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                          n.type === 'success' ? 'bg-green-50 text-green-600' :
                          n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                          n.type === 'error' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {n.type === 'success' ? <Check size={18} /> :
                           n.type === 'warning' ? <AlertCircle size={18} /> :
                           n.type === 'error' ? <AlertCircle size={18} /> :
                           <Info size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-black text-[#0A0F1E] truncate">{n.title}</p>
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                              <Clock size={10} /> {n.time}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#64748B] leading-relaxed line-clamp-2">{n.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-dashed border-[#E2E8F5] flex items-center justify-center mx-auto mb-4">
                    <BellOff size={24} className="text-[#CBD5E1]" />
                  </div>
                  <p className="text-sm font-black text-[#0A0F1E]">All caught up!</p>
                  <p className="text-xs font-medium text-[#94A3B8] mt-1">No new notifications for you.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F8FAFF] border-t border-[#E8EFFE]">
              <button className="w-full py-3 rounded-2xl bg-white border border-[#E2E8F5] text-xs font-black text-[#059669] uppercase tracking-widest hover:bg-[#059669] hover:text-white hover:border-[#059669] transition-all shadow-sm">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

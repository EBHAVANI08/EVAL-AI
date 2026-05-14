'use client';

import React, { useState } from 'react';
import { Bell, Lock, User, Palette, Shield } from 'lucide-react';

const sections = [
  {
    icon: User,
    label: 'Account',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    items: ['Display Name', 'Email Address', 'Language'],
  },
  {
    icon: Bell,
    label: 'Notifications',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    items: ['Email Notifications', 'Result Alerts', 'Announcement Alerts'],
  },
  {
    icon: Lock,
    label: 'Security',
    color: 'text-green-600',
    bg: 'bg-green-50',
    items: ['Change Password', 'Two-Factor Authentication'],
  },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, results: true, announcements: false });

  return (
    <div className="px-8 py-6 max-w-2xl mx-auto space-y-5">
      {/* Account */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <User size={16} className="text-orange-500" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Account Settings</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Display Name', value: 'Student' },
            { label: 'Email Address', value: 'student@school.edu' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
              <input
                defaultValue={field.value}
                className="w-full text-sm text-foreground bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          ))}
          <button className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bell size={16} className="text-blue-500" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'results' as const, label: 'Result Alerts', desc: 'Get notified when results are published' },
            { key: 'announcements' as const, label: 'Announcement Alerts', desc: 'School-wide announcements' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-orange-500' : 'bg-muted-foreground/30'
                }`}
                style={{ height: '22px', width: '40px' }}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Shield size={16} className="text-green-600" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Security</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Current Password', placeholder: '••••••••' },
            { label: 'New Password', placeholder: '••••••••' },
            { label: 'Confirm New Password', placeholder: '••••••••' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
              <input
                type="password"
                placeholder={field.placeholder}
                className="w-full text-sm text-foreground bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          ))}
          <button className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

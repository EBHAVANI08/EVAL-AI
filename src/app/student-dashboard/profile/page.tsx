'use client';

import React, { useState, useRef } from 'react';
import {
  User, Mail, Phone, Calendar, BookOpen, Hash, GraduationCap,
  Edit2, Camera, Award, FileText, ClipboardList, TrendingUp,
  MapPin, Shield, Clock, ChevronRight,
} from 'lucide-react';

const statsCards = [
  { label: 'Papers Evaluated', value: '0', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { label: 'Average Score', value: '—', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'Pending Review', value: '0', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { label: 'Class Rank', value: '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
];

const personalInfo = [
  { label: 'Full Name', value: 'Student', icon: User },
  { label: 'Email Address', value: 'student@school.edu', icon: Mail },
  { label: 'Phone Number', value: '+91 98765 43210', icon: Phone },
  { label: 'Date of Birth', value: '01 January 2008', icon: Calendar },
  { label: 'Address', value: 'Chennai, Tamil Nadu', icon: MapPin },
];

const academicInfo = [
  { label: 'Student ID', value: 'ST2024001', icon: Hash },
  { label: 'Class', value: 'XII', icon: GraduationCap },
  { label: 'Section', value: 'A', icon: BookOpen },
  { label: 'Roll Number', value: '001', icon: Hash },
  { label: 'Academic Year', value: '2024 – 2025', icon: Calendar },
];

const recentActivity = [
  { subject: 'Physics', exam: 'Unit Test 1', status: 'Pending', date: '—', score: '—' },
];

export default function StudentProfilePage() {
  const [editMode, setEditMode]   = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  return (
    <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">

      {/* Profile hero card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Cover gradient */}
        <div className="h-36 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 relative">
          <button className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-lg transition-colors">
            <Camera size={12} /> Change Cover
          </button>
        </div>

        {/* Avatar + identity */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            {/* Avatar */}
            <div className="relative">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="w-24 h-24 rounded-2xl border-4 border-card shadow-md overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">S</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow transition-colors"
                title="Change photo"
              >
                <Camera size={12} className="text-white" />
              </button>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                editMode
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'border border-border hover:bg-muted text-foreground'
              }`}
            >
              <Edit2 size={14} />
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {/* Name + meta */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">Student</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Class XII – A &nbsp;|&nbsp; Roll No: ST2024001</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <Shield size={11} /> Active Student
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                <Clock size={11} /> Academic Year 2024–25
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                <GraduationCap size={11} /> Eval AI School
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-card border ${s.border} rounded-2xl p-5 shadow-sm`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <User size={16} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Personal Information</h3>
            </div>
            {editMode && (
              <button className="text-xs text-orange-500 hover:underline">Edit</button>
            )}
          </div>
          <div className="space-y-4">
            {personalInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{info.label}</p>
                    {editMode ? (
                      <input
                        defaultValue={info.value}
                        className="w-full mt-1 text-sm font-semibold text-foreground bg-muted border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground mt-0.5">{info.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <GraduationCap size={16} className="text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Academic Information</h3>
            </div>
          </div>
          <div className="space-y-4">
            {academicInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{info.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent evaluations */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <ClipboardList size={16} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Recent Evaluations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your latest evaluated answer sheets</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs text-orange-500 hover:underline font-semibold">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {/* Table header */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-5 gap-4">
          {['Subject', 'Exam', 'Date', 'Score', 'Status'].map((h) => (
            <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {recentActivity.map((r, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-5 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <span className="text-sm font-semibold text-foreground">{r.subject}</span>
            <span className="text-sm text-muted-foreground">{r.exam}</span>
            <span className="text-sm text-muted-foreground">{r.date}</span>
            <span className="text-sm font-bold text-foreground">{r.score}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">
              <Clock size={10} /> {r.status}
            </span>
          </div>
        ))}

        <div className="px-6 py-10 text-center">
          <ClipboardList size={28} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-semibold">No evaluations completed yet</p>
          <p className="text-xs text-muted-foreground mt-1">Results will appear here once your teacher evaluates your papers</p>
        </div>
      </div>
    </div>
  );
}

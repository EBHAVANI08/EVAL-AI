'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import {
  BookOpen, GraduationCap, ShieldCheck, Brain,
  Eye, EyeOff, ArrowRight, Loader2, UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

type Role = 'teacher' | 'student' | 'admin';
type AuthMode = 'login' | 'register';

const roles: { id: Role; label: string; icon: React.ElementType; color: string; bg: string; ring: string }[] = [
  { id: 'teacher', label: 'Teacher', icon: BookOpen,     color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', ring: 'ring-indigo-300' },
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-cyan-600',   bg: 'bg-cyan-50 border-cyan-200',     ring: 'ring-cyan-300' },
  { id: 'admin',   label: 'Admin',   icon: ShieldCheck,  color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', ring: 'ring-violet-300' },
];

const QUICK_LOGINS: { role: Role; label: string; email: string; password: string; color: string; bg: string; border: string }[] = [
  { role: 'teacher', label: 'Teacher',  email: 'teacher@kamglobalit.com', password: 'Welcome@2026', color: 'text-indigo-700', bg: 'bg-indigo-50 hover:bg-indigo-100',  border: 'border-indigo-200' },
  { role: 'student', label: 'Student',  email: 'student@kamglobalit.com', password: 'Welcome@2026', color: 'text-cyan-700',   bg: 'bg-cyan-50 hover:bg-cyan-100',      border: 'border-cyan-200' },
  { role: 'admin',   label: 'Admin',    email: 'admin@kamglobalit.com',   password: 'Welcome@2026', color: 'text-violet-700', bg: 'bg-violet-50 hover:bg-violet-100',  border: 'border-violet-200' },
];

const callbackUrls: Record<Role, string> = {
  teacher: '/teacher-dashboard',
  student: '/student-dashboard',
  admin:   '/admin-dashboard',
};

/* ── Google SVG ───────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function AuthPageClient() {
  const [role, setRole]   = useState<Role>('teacher');
  const [mode, setMode]   = useState<AuthMode>('login');
  const [showPw, setShowPw]     = useState(false);
  const [showPw2, setShowPw2]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [qLoading, setQLoading] = useState<Role | null>(null);

  /* Login form */
  const loginForm = useForm<{ email: string; password: string }>();

  /* Register form */
  const regForm = useForm<{
    name: string; email: string; password: string; confirmPassword: string;
    rollNo: string; studentClass: string; school: string;
  }>();

  /* ── Login ──────────────────────────────────────────────────────────── */
  const onLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    const res = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
    if (res?.ok) {
      // Verify the signed-in user's role matches the selected portal
      const session = await getSession();
      const userRole = (session?.user as any)?.role as Role | undefined;
      if (userRole && userRole !== role) {
        // Role mismatch — wrong portal selected
        await signOut({ redirect: false });
        const portalLabel = roles.find(r => r.id === userRole)?.label ?? userRole;
        loginForm.setError('email', { message: `Wrong portal — these credentials belong to a ${portalLabel} account` });
        toast.error(`Please select the "${portalLabel}" portal to sign in`);
        setLoading(false);
      } else {
        toast.success('Welcome back!');
        window.location.href = callbackUrls[role];
      }
    } else {
      loginForm.setError('email', { message: 'Invalid email or password' });
      setLoading(false);
    }
  };

  /* ── Quick login ────────────────────────────────────────────────────── */
  const onQuickLogin = async (ql: typeof QUICK_LOGINS[number]) => {
    setQLoading(ql.role);
    setRole(ql.role);
    const res = await signIn('credentials', { email: ql.email, password: ql.password, redirect: false });
    if (res?.ok) {
      toast.success(`Signed in as ${ql.label}`);
      window.location.href = callbackUrls[ql.role];
    } else {
      toast.error('Quick login failed — check credentials');
      setQLoading(null);
    }
  };

  /* ── Google sign-in ─────────────────────────────────────────────────── */
  const onGoogle = async () => {
    setGLoading(true);
    await signIn('google', { callbackUrl: callbackUrls[role] });
  };

  /* ── Register ───────────────────────────────────────────────────────── */
  const onRegister = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      regForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name, email: data.email, password: data.password,
          role, rollNo: data.rollNo || null,
          studentClass: data.studentClass || null, school: data.school || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Registration failed');
        setLoading(false);
        return;
      }
      toast.success('Account created! Signing you in…');
      const signInRes = await signIn('credentials', {
        email: data.email, password: data.password, redirect: false,
      });
      if (signInRes?.ok) {
        window.location.href = callbackUrls[role];
      } else {
        setMode('login');
        setLoading(false);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F4FF]">

      {/* ── Left brand panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[460px] xl:w-[520px] shrink-0 bg-gradient-to-br from-primary via-indigo-600 to-violet-700 relative overflow-hidden p-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-white/10"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-white/10"
          />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-tight">Grade.ai</p>
            <p className="text-white/50 text-xs">AI Examination Platform</p>
          </div>
        </div>

        <div className="mt-16 relative z-10">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            Smarter grading.<br />Better outcomes.
          </h1>
          <p className="text-white/65 text-base leading-relaxed">
            AI-powered answer evaluation with OCR, multilingual support and instant scoring — built for modern classrooms.
          </p>
        </div>

        <div className="mt-10 space-y-3 relative z-10">
          {['Handwritten OCR in 100+ languages', 'AI confidence scoring per answer', 'Instant model answer generation', 'CBSE, IB, Cambridge & more'].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ArrowRight size={11} className="text-white" />
              </div>
              <p className="text-white/75 text-sm">{f}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto relative z-10 bg-white/10 border border-white/15 rounded-2xl px-5 py-4">
          <p className="text-white font-semibold text-sm">Trusted by schools worldwide</p>
          <p className="text-white/50 text-xs mt-1">Evaluate thousands of answer sheets in minutes, not hours.</p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-lg">Grade.ai</span>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'register' && <UserPlus size={13} />}
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <motion.button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-2 transition-all duration-200 ${
                    active ? `${r.bg} ring-2 ${r.ring} ring-offset-1` : 'bg-card border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <Icon size={20} className={active ? r.color : 'text-muted-foreground'} />
                  <span className={`text-xs font-semibold ${active ? r.color : 'text-muted-foreground'}`}>{r.label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN ─────────────────────────────────────────────────── */}
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <input
                    type="email" autoComplete="email" placeholder="you@school.edu.in"
                    className="input-field"
                    {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-negative mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-foreground">Password</label>
                    <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} autoComplete="current-password"
                      placeholder="Enter your password" className="input-field pr-10"
                      {...loginForm.register('password', { required: 'Password is required' })}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-negative mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <><Loader2 size={16} className="animate-spin" />Signing in…</> : <>Sign in as {roles.find((r) => r.id === role)?.label} <ArrowRight size={15} /></>}
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or continue with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google */}
                <button type="button" onClick={onGoogle} disabled={gLoading}
                  className="w-full py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-semibold text-foreground flex items-center justify-center gap-2.5 disabled:opacity-60">
                  {gLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                  Continue with Google
                </button>

                {/* Quick login */}
                <div className="relative flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Quick Login (Demo)</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {QUICK_LOGINS.map((ql) => {
                    const Icon = roles.find((r) => r.id === ql.role)?.icon ?? BookOpen;
                    const isLoading = qLoading === ql.role;
                    return (
                      <button
                        key={ql.role}
                        type="button"
                        onClick={() => onQuickLogin(ql)}
                        disabled={!!qLoading}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all disabled:opacity-60 ${ql.bg} ${ql.border} ${ql.color}`}
                      >
                        {isLoading
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Icon size={16} />}
                        <span className="text-[11px] font-semibold">{ql.label}</span>
                        <span className="text-[9px] opacity-60 leading-tight text-center">
                          {ql.email.charAt(0).toUpperCase() + ql.email.slice(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-muted-foreground text-center -mt-1">
                  All demo accounts use password: <span className="font-mono font-semibold">Welcome@2026</span>
                </p>
              </motion.form>
            )}

            {/* ── REGISTER ──────────────────────────────────────────────── */}
            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={regForm.handleSubmit(onRegister)}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <input type="text" placeholder="Your full name" className="input-field"
                    {...regForm.register('name', { required: 'Name is required' })} />
                  {regForm.formState.errors.name && <p className="text-xs text-negative mt-1">{regForm.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <input type="email" placeholder="you@school.edu.in" className="input-field"
                    {...regForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })} />
                  {regForm.formState.errors.email && <p className="text-xs text-negative mt-1">{regForm.formState.errors.email.message}</p>}
                </div>

                {/* Student-only fields */}
                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Roll No.</label>
                      <input type="text" placeholder="e.g. DPS-2026-001" className="input-field"
                        {...regForm.register('rollNo', { required: 'Roll No. is required' })} />
                      {regForm.formState.errors.rollNo && <p className="text-xs text-negative mt-1">{regForm.formState.errors.rollNo.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Class</label>
                      <input type="text" placeholder="e.g. XII-A" className="input-field"
                        {...regForm.register('studentClass')} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">School / Institution</label>
                  <input type="text" placeholder="School or institute name" className="input-field"
                    {...regForm.register('school')} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-field pr-10"
                      {...regForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {regForm.formState.errors.password && <p className="text-xs text-negative mt-1">{regForm.formState.errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input type={showPw2 ? 'text' : 'password'} placeholder="Re-enter password" className="input-field pr-10"
                      {...regForm.register('confirmPassword', { required: 'Please confirm your password' })} />
                    <button type="button" onClick={() => setShowPw2((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {regForm.formState.errors.confirmPassword && <p className="text-xs text-negative mt-1">{regForm.formState.errors.confirmPassword.message}</p>}
                </div>

                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70 !mt-5">
                  {loading ? <><Loader2 size={16} className="animate-spin" />Creating account…</> : <><UserPlus size={15} />Create {roles.find((r) => r.id === role)?.label} Account</>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === 'login'
              ? <>No account? <button onClick={() => setMode('register')} className="text-primary font-semibold hover:underline">Create one free</button></>
              : <>Already have an account? <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">Sign in</button></>}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

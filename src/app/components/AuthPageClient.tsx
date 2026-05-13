'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, BookOpen, ShieldCheck, CheckCircle2, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';


type Role = 'teacher' | 'student' | 'admin';
type AuthMode = 'login' | 'signup';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupFormData {
  fullName: string;
  email: string;
  schoolName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}


const roleConfig = {
  teacher: { label: 'Teacher', icon: BookOpen, color: 'text-primary', bg: 'bg-secondary border-primary' },
  student: { label: 'Student', icon: GraduationCap, color: 'text-accent', bg: 'bg-cyan-50 border-accent' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-400' },
};

const features = [
  'AI-powered answer evaluation with 94% accuracy',
  'Handwritten OCR with 100+ world language support',
  'Instant ideal answer generation per question',
  'All curricula — CBSE, IB, Cambridge, AP & more',
];

export default function AuthPageClient() {
  const [role, setRole] = useState<Role>('teacher');
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormData>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupFormData>({ defaultValues: { fullName: '', email: '', schoolName: '', password: '', confirmPassword: '', acceptTerms: false } });

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const callbackUrl =
      role === 'teacher' ? '/teacher-dashboard'
      : role === 'student' ? '/student-dashboard'
      : '/admin-dashboard';
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl,
      redirect: false,
    });
    if (result?.error) {
      loginForm.setError('email', { message: 'Invalid credentials — use the demo accounts below' });
      setIsSubmitting(false);
      return;
    }
    toast.success(`Welcome back! Signing in as ${roleConfig[role].label}...`);
    window.location.href = callbackUrl;
    setIsSubmitting(false);
  };

  const handleSignupSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsSubmitting(true);
    // BACKEND: POST /api/auth/register with { fullName, email, schoolName, password, role }
    await new Promise((r) => setTimeout(r, 1400));
    toast.success(`Account created! Welcome, ${data.fullName}!`);
    setTimeout(() => {
      if (role === 'teacher') window.location.href = '/teacher-dashboard';
      else if (role === 'student') window.location.href = '/student-dashboard';
      else window.location.href = '/admin-dashboard';
    }, 800);
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const callbackUrl =
      role === 'teacher' ? '/teacher-dashboard'
      : role === 'student' ? '/student-dashboard'
      : '/admin-dashboard';
    await signIn('google', { callbackUrl });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col w-[480px] xl:w-[520px] shrink-0 bg-gradient-to-br from-primary via-indigo-600 to-blue-700 relative overflow-hidden p-10">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-blue-300/10" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-tight">Eval AI</p>
            <p className="text-white/60 text-xs">AI Examination Platform</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="mt-12 relative z-10">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            AI-powered exam evaluation for classrooms worldwide
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Evaluate answer sheets in minutes, not hours. OCR + AI scoring + multilingual support across 100+ world languages.
          </p>
        </div>

        {/* Features list */}
        <div className="mt-8 space-y-3 relative z-10">
          {features.map((f, i) => (
            <div key={`feature-${i}`} className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-blue-200 mt-0.5 shrink-0" />
              <p className="text-white/80 text-sm">{f}</p>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-auto relative z-10">
          <div className="bg-white/10 rounded-2xl px-5 py-4 border border-white/10">
            <p className="text-white font-600 text-sm">Built for All Curricula Worldwide</p>
            <p className="text-white/60 text-xs mt-1">Supports handwritten answer sheets in 100+ languages globally</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-foreground">Eval AI</span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Mode tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={`mode-${m}`}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-600 transition-all duration-200 ${
                  mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-xs font-600 text-muted-foreground uppercase tracking-widest mb-2">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(roleConfig) as [Role, typeof roleConfig.teacher][]).map(([r, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={`role-${r}`}
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                      role === r ? cfg.bg : 'bg-card border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <Icon size={18} className={role === r ? cfg.color : 'text-muted-foreground'} />
                    <span className={`text-xs font-600 ${role === r ? cfg.color : 'text-muted-foreground'}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Forms */}
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="priya.rajan@school.edu.in"
                  {...loginForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-negative mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-600 text-foreground">Password</label>
                  <button type="button" className="text-xs text-primary hover:underline font-500">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    {...loginForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-negative mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded accent-primary"
                  {...loginForm.register('remember')}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Keep me signed in for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  `Sign In as ${roleConfig[role].label}`
                )}
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-500 text-foreground flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Priya Rajan"
                  {...signupForm.register('fullName', { required: 'Full name is required' })}
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-xs text-negative mt-1">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">School / Institute Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Delhi Public School, Vasant Kunj"
                  {...signupForm.register('schoolName', { required: 'School name is required' })}
                />
                {signupForm.formState.errors.schoolName && (
                  <p className="text-xs text-negative mt-1">{signupForm.formState.errors.schoolName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Work Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@school.edu.in"
                  {...signupForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-negative mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Min. 8 characters"
                    {...signupForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters required' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-negative mt-1">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Re-enter password"
                    {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-negative mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-0.5 accent-primary"
                  {...signupForm.register('acceptTerms', { required: 'You must accept the terms' })}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the{' '}
                  <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                </label>
              </div>
              {signupForm.formState.errors.acceptTerms && (
                <p className="text-xs text-negative">{signupForm.formState.errors.acceptTerms.message}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  `Create ${roleConfig[role].label} Account`
                )}
              </button>
            </form>
          )}


          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary font-600 hover:underline">
                  Create one free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-primary font-600 hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
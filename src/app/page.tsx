'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, ClipboardCheck, FileText, Lightbulb, ScanLine, Languages,
  Upload, ShieldCheck, BookOpen, GraduationCap,
  ArrowRight, CheckCircle2, Zap, Globe, Award, Star,
  ChevronRight, Menu, X, Terminal, Cpu, Lock,
} from 'lucide-react';

/* ── Data ──────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
    tag: 'MODULE_01',
    title: 'Answer Sheet Evaluator',
    desc: 'Ingest scanned answer sheets via OCR pipeline. AI extracts, scores and confidence-rates each response at question-level granularity — results in under 10 seconds.',
    chips: ['OCR_ENGINE', 'AI_SCORING', 'OVERRIDE_API'],
  },
  {
    icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100',
    tag: 'MODULE_02',
    title: 'Paper Analyzer',
    desc: 'Parse question papers programmatically — auto-classify by topic, difficulty tier, and bloom level. Output structured JSON marking schemes ready for evaluation.',
    chips: ['AUTO_PARSE', 'DIFFICULTY_MAP', 'SCHEMA_OUT'],
  },
  {
    icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
    tag: 'MODULE_03',
    title: 'Answer Generator',
    desc: 'Synthesize board-calibrated model answers for any question using curriculum-aware LLM inference. Covers CBSE, IB, Cambridge, and all major state boards.',
    chips: ['CBSE', 'IB', 'CAMBRIDGE', 'STATE_BOARD'],
  },
  {
    icon: ScanLine, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100',
    tag: 'MODULE_04',
    title: 'Diagram Analyzer',
    desc: 'Computer-vision layer recognizes hand-drawn diagrams, circuit schematics, and data plots. Evaluates structural accuracy against expected representations.',
    chips: ['CV_ENGINE', 'SCHEMATICS', 'PLOT_ANALYSIS'],
  },
  {
    icon: Languages, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    tag: 'MODULE_05',
    title: 'Multilingual Engine',
    desc: 'Native-script evaluation across 100+ languages. Zero-degradation accuracy for Devanagari, Arabic, Tamil, Telugu, Bengali and all GCC-region scripts.',
    chips: ['100+_LANG', 'ARABIC', 'DEVANAGARI', 'GCC_READY'],
  },
  {
    icon: Upload, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100',
    tag: 'MODULE_06',
    title: 'Student Sheet Upload',
    desc: 'Secure async file ingestion — student uploads propagate directly into the teacher evaluation queue with subject, grade, and metadata tagging.',
    chips: ['ASYNC_UPLOAD', 'QUEUE_PUSH', 'METADATA_TAG'],
  },
];

const roles = [
  {
    icon: BookOpen, bg: 'from-indigo-500 to-violet-600',
    label: 'ROLE // TEACHER',
    title: 'Teacher Portal',
    desc: 'High-throughput evaluation interface. Process 100s of answer sheets with AI pre-scoring, manual override controls, and real-time class analytics — all in a unified workspace.',
    points: [
      '98% AI confidence per question',
      'Single-click score override',
      'Live class performance dashboard',
      'On-demand model answer synthesis',
    ],
    cta: 'Access Teacher Portal',
    href: '/login',
  },
  {
    icon: GraduationCap, bg: 'from-cyan-500 to-blue-600',
    label: 'ROLE // STUDENT',
    title: 'Student Portal',
    desc: 'Direct submission interface with real-time result tracking. View per-question AI feedback, score breakdowns, and model answers — then message the teacher with specific doubts.',
    points: [
      'Secure direct sheet submission',
      'Per-question score breakdown',
      'AI feedback + model answers',
      'In-app teacher messaging',
    ],
    cta: 'Access Student Portal',
    href: '/login',
  },
  {
    icon: ShieldCheck, bg: 'from-violet-500 to-purple-600',
    label: 'ROLE // ADMIN',
    title: 'Admin Console',
    desc: 'Full platform governance — onboard institutions, manage role assignments, monitor evaluation throughput, and track system health across all nodes from a single control surface.',
    points: [
      'Multi-school onboarding',
      'Platform-wide analytics',
      'Role-based access control',
      'System health telemetry',
    ],
    cta: 'Access Admin Console',
    href: '/login',
  },
];

const stats = [
  { value: '98%',  label: 'AI_CONFIDENCE',    icon: Star  },
  { value: '100+', label: 'LANG_SUPPORTED',    icon: Globe },
  { value: '10×',  label: 'FASTER_VS_MANUAL',  icon: Zap   },
  { value: '24/7', label: 'UPTIME_SLA',         icon: Award },
];

const workflow = [
  {
    step: '01', icon: Upload,
    title: 'INGEST',
    desc: 'Teacher or student pushes scanned / photographed answer sheet via secure upload endpoint.',
  },
  {
    step: '02', icon: Cpu,
    title: 'PROCESS',
    desc: 'AI pipeline runs OCR → answer extraction → per-question scoring with confidence weighting.',
  },
  {
    step: '03', icon: Terminal,
    title: 'REVIEW',
    desc: 'Teacher audits AI scores in the evaluation workspace. Override any mark with a single action.',
  },
  {
    step: '04', icon: CheckCircle2,
    title: 'PUBLISH',
    desc: 'Finalized scores and AI feedback delivered to student dashboard. Audit trail stored in DB.',
  },
];

const compliance = ['ISO 27001', 'SOC 2', 'GDPR', 'ZATCA'];

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-sm">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight">Eval AI</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2 font-mono">v2.0</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Roles', '#roles']].map(([label, href]) => (
              <a key={label} href={href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-tight">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/login"
              className="text-sm font-bold text-white bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 rounded-xl shadow-sm hover:brightness-110 transition-all flex items-center gap-1.5 tracking-tight">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>

          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 rounded-lg hover:bg-muted">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-border px-6 py-4 space-y-3">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Roles', '#roles']].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1.5">{label}</a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="block w-full text-center text-sm font-bold text-white bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 rounded-xl mt-2">
              Get Started
            </Link>
          </motion.div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-br from-[#F5F4FF] via-white to-[#EEF2FF]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/8" />
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, delay: 3 }}
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/8" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* KAM badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6 font-mono tracking-wide">
              <Zap size={11} /> POWERED BY KAM GLOBAL AI
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl xl:text-7xl font-bold text-foreground leading-tight tracking-tight mb-6">
            Next-Gen Exam<br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              Intelligence.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto">
            Eval AI automates the entire examination pipeline — OCR ingestion, AI scoring, diagram analysis, multilingual evaluation — delivering teacher-grade accuracy at machine speed.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm font-mono text-primary/70 mb-10 tracking-wide">
            ∟ Built on KAM Global AI infrastructure · GCC-ready · ISO 27001 certified
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login"
              className="flex items-center gap-2 text-base font-bold text-white bg-gradient-to-r from-primary to-violet-600 px-8 py-3.5 rounded-2xl shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all tracking-tight">
              Access Platform <ArrowRight size={18} />
            </Link>
            <a href="#features"
              className="flex items-center gap-2 text-base font-semibold text-foreground border border-border bg-white px-8 py-3.5 rounded-2xl hover:bg-muted transition-colors tracking-tight">
              Explore Modules <ChevronRight size={18} />
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <p className="text-3xl font-bold text-foreground font-mono tracking-tight">{value}</p>
                <p className="text-[10px] font-mono text-primary/60 mt-1.5 tracking-widest uppercase">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.25em]">// CORE_MODULES</span>
            <h2 className="text-4xl font-bold text-foreground mt-3 mb-4 tracking-tight">Six AI-Native Modules</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              End-to-end examination automation — from ingestion to result publication — on a single integrated platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`bg-white border ${f.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                      <Icon size={22} className={f.color} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold tracking-widest ${f.color} opacity-60`}>{f.tag}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.chips.map(c => (
                      <span key={c} className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md ${f.bg} ${f.color} tracking-wide`}>{c}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#F5F4FF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.25em]">// PIPELINE_OVERVIEW</span>
            <h2 className="text-4xl font-bold text-foreground mt-3 mb-4 tracking-tight">Evaluation Pipeline</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four-stage automated pipeline from raw submission to published result — fully auditable at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
            {workflow.map((w, i) => {
              const Icon = w.icon;
              return (
                <motion.div key={w.step}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mb-4 shadow-lg relative z-10">
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-[10px] font-mono text-primary/60 tracking-[0.2em] mb-1">{w.step}</span>
                  <h3 className="font-bold text-foreground mb-2 font-mono tracking-wide">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.25em]">// ACCESS_ROLES</span>
            <h2 className="text-4xl font-bold text-foreground mt-3 mb-4 tracking-tight">Three Distinct Portals</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Role-scoped access with dedicated UI/UX for each stakeholder — zero privilege overlap.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div key={r.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className={`bg-gradient-to-br ${r.bg} p-8 text-white`}>
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/60 block mb-3">{r.label}</span>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 tracking-tight">{r.title}</h3>
                    <p className="text-white/75 text-sm leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="bg-white p-6">
                    <ul className="space-y-3 mb-6">
                      {r.points.map(pt => (
                        <li key={pt} className="flex items-start gap-3">
                          <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={r.href}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary/20 text-primary text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all tracking-tight">
                      {r.cta} <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10" />
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, delay: 3 }}
            className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[10px] font-mono font-bold text-white/50 tracking-[0.25em] block mb-6">// DEPLOY_EVAL_AI</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              Ready to deploy<br />intelligent grading?
            </h2>
            <p className="text-white/70 text-base mb-4 max-w-xl mx-auto leading-relaxed">
              Join institutions across the GCC and beyond already running Eval AI — powered by KAM Global AI's enterprise infrastructure.
            </p>
            <p className="text-white/40 text-xs font-mono tracking-widest mb-10">
              ISO_27001 · SOC_2 · GDPR · ZATCA · 22+ YRS WORKFORCE EXCELLENCE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login"
                className="flex items-center justify-center gap-2 text-base font-bold text-primary bg-white px-8 py-3.5 rounded-2xl shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all tracking-tight">
                Access Platform <ArrowRight size={18} />
              </Link>
              <Link href="/login"
                className="flex items-center justify-center gap-2 text-base font-semibold text-white border-2 border-white/40 px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-colors tracking-tight">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F0B2D] text-white/60 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">

            {/* Brand */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow">
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-tight tracking-tight">Eval AI</p>
                  <p className="text-[10px] font-mono text-white/40 leading-tight tracking-widest">PART OF KAM GLOBAL AI</p>
                </div>
              </div>

              <p className="text-sm text-white/55 leading-relaxed max-w-xs">
                AI-native examination platform. OCR ingestion → LLM scoring → multilingual evaluation → result publication — fully automated, fully auditable.
              </p>

              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Globe size={13} className="text-white/60 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white/80 tracking-tight">KAM International Group</p>
                  <p className="text-[10px] font-mono text-white/40 tracking-wide">22+ YRS · GCC · 6 COUNTRIES · KUWAIT HQ</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {[
                  { label: 'Website', href: 'https://kamglobalai.com', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                  { label: 'Email', href: 'mailto:info@kamglobalai.com', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                  { label: 'Phone', href: 'tel:+96500000000', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.09 6.09l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                    className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all">
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Platform</p>
              <ul className="space-y-3">
                {['Answer Evaluator', 'Paper Analyzer', 'Answer Generator', 'Diagram Analyzer', 'Multilingual Engine', 'Student Upload'].map(item => (
                  <li key={item}>
                    <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Company</p>
              <ul className="space-y-3">
                {[{ l: 'About Us', h: '/login' }, { l: 'KAM Group', h: 'https://kamglobalai.com' }, { l: 'Careers', h: '/login' }, { l: 'Blog', h: '/login' }, { l: 'Contact', h: '/login' }].map(item => (
                  <li key={item.l}>
                    <a href={item.h} target={item.h.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                      className="text-sm text-white/50 hover:text-white transition-colors">{item.l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Support</p>
              <ul className="space-y-3">
                {['Documentation', 'API Reference', 'Status', 'Privacy Policy', 'Terms of Service'].map(item => (
                  <li key={item}>
                    <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-mono text-white/30 text-center md:text-left tracking-wide">
              © 2024 KAM Global AI, part of KAM International Group. All rights reserved.
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {compliance.map(badge => (
                <span key={badge}
                  className="text-[10px] font-mono font-bold text-white/50 border border-white/15 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white/80 transition-colors cursor-default tracking-widest">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

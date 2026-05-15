'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform, MotionValue } from 'framer-motion';
import {
  Brain, ClipboardCheck, FileText, Lightbulb, ScanLine, Languages,
  Upload, ShieldCheck, TrendingUp,
  ArrowRight, CheckCircle2, Zap, Globe, Star,
  Cpu, Sparkles,
  Building2, Lock,
} from 'lucide-react';

/* ─── Feature Card ───────────────────────────────────────────────── */
const FeatureCard = ({ f, i }: { f: any; i: number }) => {
  const Icon = f.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white border border-slate-100 rounded-3xl p-8 overflow-hidden cursor-default
                 hover:border-transparent transition-all duration-500
                 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_32px_80px_-8px_rgba(0,0,0,0.14)]"
      style={{ '--glow': f.color } as any}
    >
      {/* subtle top-right tint on hover */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: f.color }}
      />

      {/* icon */}
      <div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: `${f.color}15` }}
      >
        <Icon size={26} style={{ color: f.color }} className="relative z-10" />
      </div>

      {/* text */}
      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: f.color }}>{f.subtitle}</p>
      <h3 className="text-xl font-black text-[#0A0F1E] mb-3 tracking-tight">{f.title}</h3>
      <p className="text-sm text-[#64748B] leading-relaxed mb-5">{f.desc}</p>

      {/* chips */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {f.chips.map((chip: string) => (
          <span key={chip} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: f.color, borderColor: `${f.color}40`, backgroundColor: `${f.color}08` }}>
            {chip}
          </span>
        ))}
      </div>

      {/* subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, ${f.color}80, transparent)` }} />
    </motion.div>
  );
};

/* ─── Data ───────────────────────────────────────────────────────── */
const features = [
  {
    id: '01', icon: ClipboardCheck, color: '#EA580C', bg: 'bg-orange-50',
    title: 'AutoGrade AI', subtitle: 'Answer Sheet Evaluator',
    desc: 'Precise question-level evaluation with AI confidence scoring and teacher override API.',
    chips: ['OCR Engine', 'AI Scoring', 'Override API'],
    imgSrc: '/images/autograde-ai.png',
  },
  {
    id: '02', icon: FileText, color: '#7C3AED', bg: 'bg-purple-50',
    title: 'PaperIQ', subtitle: 'Paper Analyzer',
    desc: 'Automatic question classification by topic, difficulty tier, and Bloom\'s taxonomy.',
    chips: ['Auto Parse', 'Difficulty Map', 'Schema Export'],
    imgSrc: '/images/paperiq.png',
  },
  {
    id: '03', icon: Lightbulb, color: '#0891B2', bg: 'bg-cyan-50',
    title: 'AnswerForge', subtitle: 'Answer Generator',
    desc: 'Generate curriculum-aware model answers calibrated to CBSE, IB, Cambridge and state boards.',
    chips: ['CBSE', 'IB', 'Cambridge'],
    imgSrc: '/images/answerforge.png',
  },
  {
    id: '04', icon: ScanLine, color: '#059669', bg: 'bg-green-50',
    title: 'DiagramVision', subtitle: 'Diagram Analyzer',
    desc: 'Computer vision to evaluate hand-drawn schematics, circuits, and data plots.',
    chips: ['CV Engine', 'Schematics', 'Plot Analysis'],
    imgSrc: '/images/diagramvision.png',
  },
  {
    id: '05', icon: Languages, color: '#DB2777', bg: 'bg-pink-50',
    title: 'PolyEval', subtitle: 'Multilingual Engine',
    desc: 'Native-script evaluation across 100+ languages including Devanagari and Arabic.',
    chips: ['100+ Languages', 'Arabic', 'Devanagari'],
    imgSrc: '/images/polyeval.png',
  },
  {
    id: '06', icon: Upload, color: '#D97706', bg: 'bg-amber-50',
    title: 'SheetHub', subtitle: 'Submission Portal',
    desc: 'Secure async file ingestion with automatic subject tagging and queue management.',
    chips: ['Async Upload', 'Queue Push', 'Metadata Tag'],
    imgSrc: '/images/sheethub.png',
  },
];

const stats = [
  { value: '98%',  label: 'AI Accuracy',   icon: Star },
  { value: '100+', label: 'Languages',      icon: Globe },
  { value: '10×',  label: 'Efficiency',     icon: Zap },
  { value: '500+', label: 'Institutions',   icon: Building2 },
];

const workflow = [
  { step: '01', icon: Upload,        title: 'Upload',  desc: 'Upload scanned answer sheets via our secure endpoint.' },
  { step: '02', icon: Cpu,           title: 'Process', desc: 'AI runs OCR, extraction, and per-question scoring.' },
  { step: '03', icon: ClipboardCheck,title: 'Review',  desc: 'Teachers audit and finalize AI-generated marks.' },
  { step: '04', icon: CheckCircle2,  title: 'Publish', desc: 'Scores sync directly to student dashboards.' },
];

const footerLinks = [
  {
    heading: 'Product',
    links: ['AutoGrade AI', 'PaperIQ', 'AnswerForge', 'DiagramVision', 'PolyEval', 'SheetHub'],
  },
  {
    heading: 'Platform',
    links: ['Teacher Portal', 'Student Portal', 'Admin Console', 'API Reference', 'Integrations'],
  },
  {
    heading: 'Company',
    links: ['About KAM Global', 'Careers', 'Press Kit', 'Privacy Policy', 'Terms of Service'],
  },
];

/* ─── Main ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  // These transforms are only active after mount to prevent SSR hydration mismatch (#418)
  const heroY = useTransform(scrollY, [0, 800], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    setMounted(true);
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-orange-600/10 selection:text-orange-900 overflow-x-hidden">

      {/* ── Progress bar ──────────────────────────────────────────── */}
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 origin-left z-[200]" style={{ scaleX }} />

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-3 bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm' : 'py-6 bg-transparent'
      }`}>
        <div className="max-w-[1600px] mx-auto px-12 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-600/25 group-hover:scale-105 transition-transform duration-300">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <span className="font-black text-[#0A0F1E] text-2xl tracking-tight leading-none block">Grade.ai</span>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.25em]">KAM Global AI</span>
            </div>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Solutions', href: '#solutions' },
              { label: 'Workflow',  href: '#workflow'  },
              { label: 'Contact',   href: '#contact'   },
            ].map((item, i) => (
              <motion.a key={item.label} href={item.href}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.3 }}
                className="text-sm font-semibold text-[#64748B] hover:text-[#0A0F1E] transition-colors relative group">
                {item.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-500 hover:from-orange-500 hover:to-rose-400 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-orange-500/30">
                Sign In →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-36 pb-20 px-12 overflow-hidden">
        {/* large orange glow — top right */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-orange-500/20 blur-[130px] -z-10 rounded-full" />
        {/* rose glow — bottom left */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-rose-500/15 blur-[110px] -z-10 rounded-full" />
        {/* center orange halo behind heading */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-orange-400/12 blur-[100px] -z-10 rounded-full" />
        {/* animated floating orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -50, 0], x: [0, 25, 0], rotate: [0, 180, 360], opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 1.2 }}
            className="absolute -z-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full blur-2xl"
            style={{ width: 100 + i * 40, height: 100 + i * 40, top: `${15 + i * 14}%`, left: `${5 + i * 18}%` }}
          />
        ))}

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-28 items-center">
          {/* y/opacity only applied client-side to avoid SSR hydration mismatch */}
          <motion.div style={mounted ? { y: heroY, opacity: heroOpacity } : {}}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-md mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={14} className="text-orange-600" />
              </motion.div>
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">Enterprise Intelligence Engine</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="text-7xl lg:text-8xl font-black text-[#0A0F1E] tracking-tighter leading-[0.85] mb-8">
              Scale <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 animate-gradient-x">
                Genius.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg text-[#64748B] leading-relaxed mb-10 max-w-xl">
              The global benchmark for curriculum-aware AI assessment — built for CBSE, IB, Cambridge, and GCC education systems.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl bg-[#0A0F1E] text-white font-black text-base hover:bg-orange-600 transition-colors duration-400 shadow-2xl flex items-center gap-3">
                  Get Started <ArrowRight size={18} />
                </motion.button>
              </Link>
              <a href="#solutions">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#0A0F1E] font-bold text-base hover:border-orange-200 transition-colors">
                  View Solutions
                </motion.button>
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="mt-14 flex flex-wrap gap-10 border-t border-slate-100 pt-10">
              {stats.map((s) => (
                <motion.div key={s.label} whileHover={{ y: -4 }} className="cursor-default">
                  <p className="text-4xl font-black text-[#0A0F1E] tracking-tight hover:text-orange-600 transition-colors">{s.value}</p>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.4em] mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero right — Dashboard Mockup */}
          <motion.div initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, type: 'spring', damping: 20 }}
            className="relative hidden lg:block">

            {/* orange glow behind card */}
            <div className="absolute inset-[-8%] bg-gradient-to-br from-orange-400/25 to-rose-400/15 blur-[80px] rounded-full -z-10" />

            {/* Admin Console — real screenshot */}
            <motion.div whileHover={{ scale: 1.015, y: -4 }} transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.18)] ring-1 ring-white/60">

              {/* screenshot image */}
              <img
                src="/assets/images/admin%20dashboard.png"
                alt="Grade.ai Admin Console"
                className="w-full h-auto block"
                style={{ maxHeight: 460, objectFit: 'cover', objectPosition: 'top' }}
              />

              {/* subtle glass overlay at bottom for fade */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />

              {/* live badge on top bar */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">Live Preview</span>
              </div>

            </motion.div>

            {/* Enterprise Ready badge */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 z-20 bg-white backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0A0F1E] leading-tight">Enterprise Ready</p>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">SOC 2 Certified</p>
                </div>
              </div>
            </motion.div>

            {/* Real-time Sync badge — white with orange glow */}
            <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -right-4 z-20 bg-white px-4 py-3 rounded-2xl border border-orange-200/60"
              style={{ boxShadow: '0 0 0 1px rgba(234,88,12,0.15), 0 8px 32px rgba(234,88,12,0.20), 0 0 60px rgba(234,88,12,0.10)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0A0F1E] leading-tight">Real-time Sync</p>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">0.4ms Latency</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Student Analytics Showcase ───────────────────────────── */}
      <section className="py-24 px-12 relative overflow-hidden bg-[#F8FAFF]">
        {/* ambient glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-400/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-400/8 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-[1600px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* LEFT — mockup first on dark bg */}
          <motion.div initial={{ opacity: 0, x: -50, scale: 0.94 }} whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.9, type: 'spring', damping: 22 }}
            className="relative order-2 lg:order-1">

            {/* glow ring behind mockup */}
            <div className="absolute inset-[-8%] bg-gradient-to-br from-orange-500/20 to-violet-500/10 blur-[90px] rounded-full -z-10" />

            {/* real screenshot */}
            <div className="rounded-[2rem] overflow-hidden border border-slate-200/70 shadow-[0_32px_80px_rgba(0,0,0,0.10)]">
              <img
                src="/assets/images/Student%20performance%20dashboard.png"
                alt="Student Performance Dashboard"
                className="w-full h-auto block"
                style={{ maxHeight: 460, objectFit: 'cover', objectPosition: 'top' }}
              />
            </div>

            {/* floating stat chip */}
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-5 z-20 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Star size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0A0F1E] leading-none">Class Rank #4</p>
                  <p className="text-[10px] font-bold text-orange-500 mt-0.5">Top 10% overall</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — text on dark bg */}
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="order-1 lg:order-2">

            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-orange-600 font-black text-xs uppercase tracking-[0.6em] mb-4">
              Student Intelligence
            </motion.p>
            <h2 className="text-5xl lg:text-6xl font-black text-[#0A0F1E] tracking-tighter leading-tight mb-6">
              AI-Powered<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500">
                Performance
              </span><br />
              Analytics.
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed mb-10 max-w-lg">
              Every student gets a live performance dashboard — score progression, AI-driven strength/weakness insights, and subject-level breakdowns after every evaluation.
            </p>

            <div className="space-y-5">
              {[
                { label: 'Score Progression',    desc: 'Track improvement across every exam in real time',         color: '#EA580C' },
                { label: 'AI Learning Insights', desc: 'Know your strongest and weakest topic areas instantly',     color: '#10B981' },
                { label: 'Class Benchmarking',   desc: 'See where you stand vs class average per question',        color: '#1A6BFF' },
              ].map((f, i) => (
                <motion.div key={f.label} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.3 }}
                  className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${f.color}18` }}>
                    <CheckCircle2 size={18} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="font-black text-[#0A0F1E] text-sm">{f.label}</p>
                    <p className="text-sm text-[#64748B] mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.6 }}
              className="mt-10">
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.04, x: 4 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-rose-500 text-white font-black text-sm shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all">
                  View Student Portal <ArrowRight size={16} />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Solutions Grid ────────────────────────────────────────── */}
      <section id="solutions" className="py-28 px-8 bg-[#F8FAFF] relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[18rem] font-black text-[#0A0F1E]/[0.015] select-none pointer-events-none tracking-tighter leading-none">CORE</div>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-orange-400/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-400/8 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="mb-14">
            <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              className="text-orange-600 font-black text-xs uppercase tracking-[0.6em] mb-4">
              Integrated Ecosystem
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-black text-[#0A0F1E] tracking-tighter leading-tight mb-4">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">Solutions.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              className="text-base text-[#64748B] max-w-xl">
              Six core AI pillars powering the world's most advanced assessment platform.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────────── */}
      <section id="workflow" className="py-28 px-12 relative overflow-hidden bg-white">
        {/* soft ambient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/60 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100/50 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-[1600px] mx-auto relative z-10">

          {/* heading */}
          <div className="text-center mb-20">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              className="text-orange-600 font-black text-xs uppercase tracking-[0.6em] mb-4">
              The Engine Room
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl lg:text-6xl font-black text-[#0A0F1E] tracking-tighter leading-tight">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">Works.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-4 text-base text-[#64748B] max-w-lg mx-auto">
              Four seamless steps from submission to published results — all powered by AI.
            </motion.p>
          </div>

          {/* 4-step horizontal pipeline */}
          <div className="relative flex items-stretch justify-between">

            {/* full-width SVG connector track */}
            <svg
              className="absolute top-[44px] left-0 w-full h-[2px] pointer-events-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#EA580C" />
                  <stop offset="33%"  stopColor="#7C3AED" />
                  <stop offset="66%"  stopColor="#059669" />
                  <stop offset="100%" stopColor="#1A6BFF" />
                </linearGradient>
              </defs>
              {/* track line */}
              <motion.line
                x1="12.5%" y1="1" x2="87.5%" y2="1"
                stroke="url(#flowGrad)" strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
              {/* animated traveling dot */}
              {[0, 1].map((n) => (
                <motion.circle key={n} r="5" fill="url(#flowGrad)"
                  animate={{ x: ['12.5%', '87.5%'], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: n * 1.5 }}
                />
              ))}
              {/* arrow heads between steps */}
              {[33, 56.5, 79].map((pct, ai) => {
                const arrowColors = ['#7C3AED', '#059669', '#1A6BFF'];
                return (
                  <motion.polygon key={ai}
                    points={`${pct - 0.8}%,-5 ${pct + 0.8}%,1 ${pct - 0.8}%,7`}
                    fill={arrowColors[ai]}
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + ai * 0.2, duration: 0.3 }}
                  />
                );
              })}
            </svg>

            {workflow.map((w, i) => {
              const Icon = w.icon;
              const colors = ['#EA580C', '#7C3AED', '#059669', '#1A6BFF'];
              const c = colors[i];
              return (
                <motion.div key={w.step}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="relative flex flex-col items-center text-center flex-1 px-6 pt-2 pb-8 group cursor-default"
                >
                  {/* node icon */}
                  <div className="relative z-10 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="w-[88px] h-[88px] rounded-[24px] flex items-center justify-center border-2 bg-white transition-all duration-300"
                      style={{
                        borderColor: `${c}40`,
                        boxShadow: `0 0 0 6px ${c}10, 0 12px 32px ${c}20`,
                      }}
                    >
                      <Icon size={32} style={{ color: c }} />
                    </motion.div>
                    {/* step badge */}
                    <div
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-lg"
                      style={{ backgroundColor: c }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* card body */}
                  <motion.div
                    whileHover={{ boxShadow: `0 16px 48px ${c}18` }}
                    className="w-full bg-white border border-slate-100 rounded-3xl px-5 py-6 transition-all duration-300 group-hover:border-transparent"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                  >
                    <h4 className="text-lg font-black mb-2 tracking-tight" style={{ color: c }}>{w.title}</h4>
                    <p className="text-sm text-[#64748B] leading-relaxed">{w.desc}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer id="contact" className="bg-[#0A0F1E] border-t border-white/5">
        {/* top cta strip */}
        <div className="border-b border-white/5 py-14 px-8">
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-1">Ready to transform your institution?</h3>
              <p className="text-sm text-white/40">Join 500+ schools and universities worldwide.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a href="mailto:info@kamglobalai.com" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                info@kamglobalai.com
              </a>
            </div>
          </div>
        </div>

        {/* main footer grid */}
        <div className="px-8 py-16">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* brand col */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
                  <Brain size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-black text-white text-lg tracking-tight leading-none block">Grade.ai</span>
                  <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.25em]">by KAM Global AI</span>
                </div>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
                The enterprise-grade AI examination platform redefining academic assessment for the modern world.
              </p>

              {/* trust badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: ShieldCheck, label: 'SOC 2 Type II' },
                  { icon: Lock,        label: 'ISO 27001' },
                  { icon: Globe,       label: 'GDPR Ready' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50">
                    <Icon size={10} className="text-orange-500" /> {label}
                  </span>
                ))}
              </div>

              {/* social */}
              <div className="flex items-center gap-2">
                {[
                  { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                  { label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                ].map(({ label, path }) => (
                  <motion.button key={label} whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all">
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                      <path d={path} />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* link columns */}
            {footerLinks.map((col) => (
              <div key={col.heading} className="lg:col-span-2">
                <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.35em] mb-4">{col.heading}</h5>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/50 hover:text-white transition-colors font-medium">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* contact col */}
            <div className="lg:col-span-2">
              <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.35em] mb-4">Contact</h5>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">India</p>
                  <p className="text-xs text-white/50 leading-relaxed">No 544, 3rd cross, RT Nagar, Bangalore-560032</p>
                  <p className="text-xs text-white/40 mt-1">+91 80507 66363</p>
                  <p className="text-xs text-white/40">info@kamglobalai.com</p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Kuwait HQ</p>
                  <p className="text-xs text-white/50 leading-relaxed">20408 Tunisia St, Hawally, Kuwait</p>
                  <p className="text-xs text-white/40 mt-1">+965 22087764</p>
                  <p className="text-xs text-white/40">info@kamgroups.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-white/5 px-8 py-5">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.4em]">All Systems Operational</span>
            </div>
            <p className="text-[11px] text-white/25 font-medium">© 2025 KAM Global AI. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Privacy Policy', 'Terms of Service', 'Security'].map((link) => (
                <a key={link} href="#" className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-medium">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.08); }
        }
        .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 18s linear infinite; }
      ` }} />
    </div>
  );
}

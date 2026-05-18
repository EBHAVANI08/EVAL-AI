'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, Loader2, BookOpen, Hash, Calendar, Tag, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

type Paper = { id: string; title: string; subject: string; class: string; board: string; totalMarks: number; questionCount: number; createdAt: string };

export default function ExamsSection() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/question-papers').then(r => r.json())
      .then(d => { if (d.papers) setPapers(d.papers); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = papers.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.subject.toLowerCase().includes(search.toLowerCase()) ||
    p.class.toLowerCase().includes(search.toLowerCase())
  );

  const subjects = [...new Set(papers.map(p => p.subject).filter(Boolean))];

  return (
    <motion.div key="exams" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Exams</h2>
          <p className="text-[#64748B] font-bold mt-1">All question papers on the platform</p>
        </div>
        <Link href="/question-papers" className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#0A0F1E] text-white font-black text-sm hover:bg-[#1A6BFF] transition-all shadow-xl active:scale-95">
          <Plus size={18} /> New Paper
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total Papers', value: papers.length, color: '#1A6BFF', bg: 'bg-blue-50' },
          { label: 'Subjects Covered', value: subjects.length, color: '#7C3AED', bg: 'bg-purple-50' },
          { label: 'Total Questions', value: papers.reduce((a, p) => a + p.questionCount, 0), color: '#059669', bg: 'bg-green-50' },
        ].map(s => (
          <GlassCard key={s.label} className="text-center py-6">
            <p className="text-4xl font-black text-[#0A0F1E] tracking-tighter">{s.value}</p>
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-2">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-[#E2E8F5] rounded-2xl px-4 py-3 max-w-sm">
        <Search size={15} className="text-[#94A3B8]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, subject, class…"
          className="bg-transparent text-xs font-bold text-[#0A0F1E] outline-none w-full placeholder:text-[#94A3B8]" />
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 size={24} className="animate-spin text-[#94A3B8] mx-auto mb-2" /></div>
      ) : filtered.length === 0 ? (
        <GlassCard className="py-20 text-center">
          <FileText size={40} className="text-[#CBD5E1] mx-auto mb-4" />
          <p className="text-lg font-black text-[#0A0F1E]">No question papers yet</p>
          <p className="text-sm font-bold text-[#94A3B8] mt-2 mb-6">Upload papers via the Paper Analyzer to see them here</p>
          <Link href="/question-paper-analyzer" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1A6BFF] text-white font-black text-sm hover:bg-[#0A5BD4] transition-all">
            <LinkIcon size={16} /> Go to Paper Analyzer
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-[#1A6BFF]" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[10px] font-black text-[#64748B] uppercase tracking-wider">{p.board}</span>
                </div>
                <div>
                  <h3 className="font-black text-[#0A0F1E] text-base leading-tight">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs font-bold text-[#64748B]"><BookOpen size={11} />{p.subject}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#64748B]"><Tag size={11} />Class {p.class}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#64748B]"><Hash size={11} />{p.questionCount} Qs</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F1F5F9]">
                  <div>
                    <p className="text-2xl font-black text-[#0A0F1E]">{p.totalMarks}</p>
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Total Marks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#94A3B8] flex items-center gap-1 justify-end"><Calendar size={10} />{p.createdAt}</p>
                    <Link href={`/answer-sheet-evaluator`} className="mt-1 inline-flex items-center gap-1.5 text-xs font-black text-[#1A6BFF] hover:underline">
                      Use for Evaluation →
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

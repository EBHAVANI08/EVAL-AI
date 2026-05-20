'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, CheckCheck, Loader2, Clock, User } from 'lucide-react';

type Message = {
  id: string;
  evaluationId: string;
  subject: string;
  studentName: string;
  rollNo: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function TeacherMessagesInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/evaluations/message')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.messages)) setMessages(d.messages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch('/api/evaluations/message', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch('/api/evaluations/message', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    setMarkingAll(false);
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <MessageSquare size={16} className="text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-700 text-foreground">Student Messages</p>
            <p className="text-xs text-muted-foreground">Doubts &amp; queries from students</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
              {unread} new
            </span>
          )}
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="Mark all as read"
            >
              {markingAll
                ? <Loader2 size={13} className="animate-spin text-muted-foreground" />
                : <CheckCheck size={13} className="text-muted-foreground" />}
            </button>
          )}
          <button onClick={load} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Refresh">
            <RefreshCw size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-10 text-center">
          <Loader2 size={22} className="animate-spin text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading messages…</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="py-10 text-center">
          <MessageSquare size={26} className="text-muted-foreground/25 mx-auto mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">No messages yet</p>
          <p className="text-xs text-muted-foreground mt-1">Student questions will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-80 overflow-y-auto scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`px-5 py-3.5 transition-colors ${msg.read ? 'hover:bg-muted/20' : 'bg-violet-50/40 hover:bg-violet-50/60'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User size={12} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-700 text-foreground truncate">
                      {msg.studentName}
                      {msg.rollNo && <span className="font-400 text-muted-foreground ml-1">· {msg.rollNo}</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{msg.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock size={9} />
                    {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  {!msg.read && (
                    <button
                      onClick={() => markRead(msg.id)}
                      className="text-[10px] font-600 text-violet-600 hover:text-violet-800 transition-colors px-1.5 py-0.5 rounded bg-violet-100 hover:bg-violet-200"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground/80 mt-2 leading-relaxed pl-9">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

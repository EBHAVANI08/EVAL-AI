'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, GraduationCap, Brain, ClipboardCheck, Database,
  Loader2, Save, RotateCcw, Eye, EyeOff, CheckCircle2, AlertCircle,
  Plus, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

type GradeRow = { grade: string; min: number; max: number };

type Settings = {
  institutionName: string;
  board: string;
  academicYear: string;
  principalName: string;
  contactEmail: string;
  address: string;
  passingThreshold: number;
  gradingScheme: GradeRow[];
  defaultLanguage: string;
  autoSaveEvaluations: boolean;
  showAiConfidence: boolean;
  requireTeacherReview: boolean;
  maxTokens: number;
  temperature: number;
};

const DEFAULT_SETTINGS: Settings = {
  institutionName: '',
  board: 'CBSE',
  academicYear: '2025-26',
  principalName: '',
  contactEmail: '',
  address: '',
  passingThreshold: 33,
  gradingScheme: [
    { grade: 'A+', min: 91, max: 100 },
    { grade: 'A', min: 81, max: 90 },
    { grade: 'B+', min: 71, max: 80 },
    { grade: 'B', min: 61, max: 70 },
    { grade: 'C', min: 51, max: 60 },
    { grade: 'D', min: 33, max: 50 },
    { grade: 'F', min: 0, max: 32 },
  ],
  defaultLanguage: 'English',
  autoSaveEvaluations: true,
  showAiConfidence: true,
  requireTeacherReview: false,
  maxTokens: 65536,
  temperature: 0.1,
};

const TABS = [
  { id: 'institution', label: 'Institution', icon: Building2 },
  { id: 'grading', label: 'Grading', icon: GraduationCap },
  { id: 'ai', label: 'AI & API', icon: Brain },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { id: 'data', label: 'Data & Export', icon: Database },
];

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'];
const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'];

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState('institution');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<'ok' | 'error' | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => { setSettings({ ...DEFAULT_SETTINGS, ...data }); })
      .catch(() => {})
      .finally(() => setLoading(false));
    // Load API key from env display (masked)
    setApiKey('');
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function updateGrade(i: number, field: keyof GradeRow, value: string | number) {
    const scheme = [...settings.gradingScheme];
    scheme[i] = { ...scheme[i], [field]: field === 'grade' ? value : Number(value) };
    update('gradingScheme', scheme);
  }

  function addGrade() {
    update('gradingScheme', [...settings.gradingScheme, { grade: 'New', min: 0, max: 100 }]);
  }

  function removeGrade(i: number) {
    update('gradingScheme', settings.gradingScheme.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function testApiConnection() {
    if (!apiKey.trim()) { toast.error('Enter your Gemini API key first'); return; }
    setTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say "OK"' }] }], generationConfig: { maxOutputTokens: 10 } }),
        }
      );
      setApiTestResult(res.ok ? 'ok' : 'error');
    } catch {
      setApiTestResult('error');
    } finally {
      setTestingApi(false);
    }
  }

  async function exportEvaluations() {
    try {
      const res = await fetch('/api/evaluations?limit=50');
      const { evaluations } = await res.json();
      if (!evaluations?.length) { toast.error('No evaluations to export'); return; }
      const headers = ['Student', 'Roll No', 'Subject', 'Class', 'Score', 'Max Marks', 'AI Confidence', 'Overrides', 'Status', 'Date'];
      const rows = evaluations.map((e: any) => [
        e.studentName, e.rollNo, e.subject, e.class,
        e.obtained ?? '', e.maxMarks, e.aiConfidence ?? '', e.overrides, e.status, e.submittedAt,
      ]);
      const csv = [headers, ...rows].map((r) => r.map((v: any) => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'evaluations_export.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch {
      toast.error('Export failed');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <Loader2 size={28} className="animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <ClipboardCheck size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your AIExaminerPro instance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl shadow-card p-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-600 transition-colors mb-0.5 last:mb-0 ${activeTab === id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-2xl shadow-card p-6">
            {/* Institution tab */}
            {activeTab === 'institution' && (
              <div className="space-y-4">
                <h2 className="font-bold text-foreground text-lg mb-5">Institution Details</h2>
                {([
                  { key: 'institutionName', label: 'Institution Name', placeholder: 'e.g. DPS School, New Delhi' },
                  { key: 'principalName', label: "Principal's Name", placeholder: 'Full name' },
                  { key: 'contactEmail', label: 'Contact Email', placeholder: 'admin@school.edu.in' },
                ] as const).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-600 text-muted-foreground mb-1">{label}</label>
                    <input type="text" value={settings[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="input-field text-sm py-2" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Board</label>
                  <select value={settings.board} onChange={(e) => update('board', e.target.value)} className="input-field text-sm py-2">
                    {BOARDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Academic Year</label>
                  <input type="text" value={settings.academicYear} onChange={(e) => update('academicYear', e.target.value)} placeholder="2025-26" className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Address</label>
                  <textarea value={settings.address} onChange={(e) => update('address', e.target.value)} placeholder="Full address" rows={2} className="input-field text-sm resize-none" />
                </div>
              </div>
            )}

            {/* Grading tab */}
            {activeTab === 'grading' && (
              <div>
                <h2 className="font-bold text-foreground text-lg mb-2">Grading Configuration</h2>
                <p className="text-sm text-muted-foreground mb-5">Configure grade boundaries and passing threshold</p>
                <div className="mb-5">
                  <label className="block text-xs font-600 text-muted-foreground mb-2">Passing Threshold: <strong className="text-foreground">{settings.passingThreshold}%</strong></label>
                  <input type="range" min={20} max={60} value={settings.passingThreshold} onChange={(e) => update('passingThreshold', Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>20%</span><span>60%</span></div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-600 text-foreground">Grading Scheme</h3>
                  <button onClick={addGrade} className="flex items-center gap-1 text-xs font-600 text-primary hover:bg-secondary px-2 py-1 rounded-lg transition-colors">
                    <Plus size={12} /> Add Grade
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {['Grade', 'Min %', 'Max %', ''].map((h) => (
                          <th key={h} className="pb-2 text-left text-xs font-600 text-muted-foreground pr-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {settings.gradingScheme.map((row, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-3">
                            <input type="text" value={row.grade} onChange={(e) => updateGrade(i, 'grade', e.target.value)} className="input-field py-1.5 text-sm w-16 text-center font-bold" />
                          </td>
                          <td className="py-2 pr-3">
                            <input type="number" min={0} max={100} value={row.min} onChange={(e) => updateGrade(i, 'min', e.target.value)} className="input-field py-1.5 text-sm w-20 font-tabular" />
                          </td>
                          <td className="py-2 pr-3">
                            <input type="number" min={0} max={100} value={row.max} onChange={(e) => updateGrade(i, 'max', e.target.value)} className="input-field py-1.5 text-sm w-20 font-tabular" />
                          </td>
                          <td className="py-2">
                            <button onClick={() => removeGrade(i)} className="p-1 hover:text-negative transition-colors">
                              <Trash2 size={13} className="text-muted-foreground hover:text-negative" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI & API tab */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <h2 className="font-bold text-foreground text-lg">AI & API Configuration</h2>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="input-field text-sm py-2 pr-10 font-mono"
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showApiKey ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Set in .env as GEMINI_API_KEY. The field above is for testing only.</p>
                  <button onClick={testApiConnection} disabled={testingApi} className="mt-2 flex items-center gap-2 text-xs font-600 text-primary hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                    {testingApi ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                    Test Connection
                    {apiTestResult === 'ok' && <CheckCircle2 size={12} className="text-positive" />}
                    {apiTestResult === 'error' && <AlertCircle size={12} className="text-negative" />}
                  </button>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs font-600 text-muted-foreground mb-1">AI Model</p>
                  <p className="text-sm font-700 text-foreground">gemini-2.5-flash</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Google Gemini 2.5 Flash (vision + text)</p>
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-2">Max Tokens: <strong className="text-foreground">{settings.maxTokens.toLocaleString()}</strong></label>
                  <input type="range" min={1024} max={65536} step={1024} value={settings.maxTokens} onChange={(e) => update('maxTokens', Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1,024</span><span>65,536</span></div>
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-2">Temperature: <strong className="text-foreground">{settings.temperature}</strong></label>
                  <input type="range" min={0} max={1} step={0.05} value={settings.temperature} onChange={(e) => update('temperature', Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Precise (0)</span><span>Creative (1)</span></div>
                </div>
              </div>
            )}

            {/* Evaluation Defaults tab */}
            {activeTab === 'evaluation' && (
              <div className="space-y-5">
                <h2 className="font-bold text-foreground text-lg">Evaluation Defaults</h2>
                {[
                  { key: 'autoSaveEvaluations' as const, label: 'Auto-save evaluations', desc: 'Automatically save evaluations to MongoDB after AI completes' },
                  { key: 'showAiConfidence' as const, label: 'Show AI confidence scores', desc: 'Display AI confidence percentage in evaluation results' },
                  { key: 'requireTeacherReview' as const, label: 'Require teacher review before finalize', desc: 'Evaluations cannot be finalized without teacher review' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-600 text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => update(key, !settings[key])}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${settings[key] ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Default Evaluation Language</label>
                  <select value={settings.defaultLanguage} onChange={(e) => update('defaultLanguage', e.target.value)} className="input-field text-sm py-2">
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Data & Export tab */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <h2 className="font-bold text-foreground text-lg">Data & Export</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Export All Evaluations', desc: 'Download all evaluations as CSV', action: exportEvaluations, icon: Database },
                    { label: 'Export Student Data', desc: 'Download student roster as CSV', action: exportEvaluations, icon: GraduationCap },
                  ].map(({ label, desc, action, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl hover:bg-secondary/40 transition-colors text-left"
                    >
                      <Icon size={18} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-600 text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="bg-negative-bg border border-negative/20 rounded-xl p-4">
                  <p className="text-sm font-600 text-negative mb-1">Danger Zone</p>
                  <p className="text-xs text-muted-foreground mb-3">These actions are irreversible. Proceed with caution.</p>
                  <button
                    onClick={() => {
                      if (confirm('This will permanently delete all evaluations older than 30 days. Are you sure?')) {
                        toast.error('This feature is coming soon');
                      }
                    }}
                    className="text-xs font-600 text-negative border border-negative/30 px-3 py-1.5 rounded-lg hover:bg-negative/10 transition-colors"
                  >
                    Clear evaluations older than 30 days
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save / Reset footer */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setSettings(DEFAULT_SETTINGS); toast.success('Reset to defaults'); }}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600"
            >
              <RotateCcw size={14} />
              Reset to Defaults
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-600 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

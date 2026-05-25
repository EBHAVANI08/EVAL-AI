/**
 * Generates a rich printable HTML evaluation report (answer sheet + analysis)
 * and opens it in a new window for printing/saving as PDF.
 * Used by both teacher (ScoreSummaryPanel) and student (Results page).
 */

interface ReportQuestion {
  qNo?: string | number;
  questionText?: string;
  aiScore?: number;
  teacherScore?: number | null;
  maxMarks: number;
  aiReasoning?: string;
  section?: string;
}

interface ReportDetail {
  studentInfo?: Record<string, any>;
  paperInfo?: Record<string, any>;
  questions?: ReportQuestion[];
  trainingData?: Record<string, any>;
  scannedImages?: string[];
  createdAt?: string;
}

function gradeFrom(pct: number) {
  if (pct >= 90) return { grade: 'A+', color: '#059669' };
  if (pct >= 80) return { grade: 'A',  color: '#059669' };
  if (pct >= 70) return { grade: 'B+', color: '#1A6BFF' };
  if (pct >= 60) return { grade: 'B',  color: '#1A6BFF' };
  if (pct >= 50) return { grade: 'C',  color: '#D97706' };
  return { grade: 'F', color: '#DC2626' };
}

export function downloadEvalReport(detail: ReportDetail, scannedImages?: string[]) {
  const obt = detail.trainingData?.totalObtained ?? 0;
  const max = detail.trainingData?.totalMax ?? detail.paperInfo?.totalMarks ?? 0;
  const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
  const { grade, color: gradeColor } = gradeFrom(pct);

  const studentName = detail.studentInfo?.name ?? '—';
  const rollNo      = detail.studentInfo?.rollNo ?? '—';
  const cls         = detail.studentInfo?.class ?? detail.studentInfo?.studentClass ?? '—';
  const school      = detail.studentInfo?.school ?? '—';
  const subject     = detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? '—';
  const dateStr     = detail.createdAt
    ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const questions   = detail.questions ?? [];
  const images      = scannedImages ?? detail.scannedImages ?? [];

  const STOP_WORDS = new Set(['the','a','an','if','is','are','what','find','which','of','and','in','for','to','that','then','given','let','be','where','such','show','prove','when','on','with','by','from']);

  const strengths  = questions
    .filter((q) => { const s = (q.teacherScore ?? q.aiScore ?? 0); return q.maxMarks > 0 && (s / q.maxMarks) >= 0.8; })
    .map((q) => {
      const words = (q.questionText ?? '').split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));
      return words.slice(0, 3).join(' ') || `Q${q.qNo}`;
    })
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 5);

  const weaknesses = questions
    .filter((q) => { const s = (q.teacherScore ?? q.aiScore ?? 0); return q.maxMarks > 0 && (s / q.maxMarks) < 0.6; })
    .map((q) => {
      const words = (q.questionText ?? '').split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));
      return words.slice(0, 3).join(' ') || `Q${q.qNo}`;
    })
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 4);

  const questionsHtml = questions.map((q, i) => {
    const score = q.teacherScore ?? q.aiScore ?? 0;
    const qPct  = q.maxMarks > 0 ? (score / q.maxMarks) * 100 : 0;
    const qColor = qPct >= 80 ? '#059669' : qPct >= 50 ? '#D97706' : '#DC2626';
    const hasOverride = q.teacherScore !== null && q.teacherScore !== undefined && q.teacherScore !== q.aiScore;
    return `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 12px; font-weight:700; color:#7C3AED; white-space:nowrap;">Q${q.qNo ?? i + 1}</td>
        <td style="padding:10px 12px; color:#374151; font-size:13px; max-width:300px;">${q.questionText ?? `Question ${i + 1}`}</td>
        <td style="padding:10px 12px; text-align:center; font-weight:700; color:${qColor};">${score} / ${q.maxMarks}</td>
        <td style="padding:10px 12px; text-align:center; font-size:12px; color:#6b7280;">
          ${hasOverride ? `<span style="color:#D97706;font-size:11px;">✎ ${q.teacherScore} (AI: ${q.aiScore})</span>` : q.aiScore}
        </td>
        <td style="padding:10px 12px; font-size:12px; color:#6b7280; max-width:280px;">${q.aiReasoning ?? '—'}</td>
      </tr>`;
  }).join('');

  const imagesHtml = images.length > 0 ? `
    <div style="margin:32px 0; page-break-before:always;">
      <h2 style="font-size:18px;font-weight:800;color:#1f2937;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
        📝 Answer Sheet — Scanned Pages
      </h2>
      <div style="display:flex;flex-wrap:wrap;gap:16px;">
        ${images.map((src, idx) => `
          <div style="page-break-inside:avoid;flex:1 1 45%;min-width:280px;">
            <p style="font-size:11px;color:#9ca3af;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Page ${idx + 1}</p>
            <img src="${src}" alt="Answer sheet page ${idx + 1}"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;display:block;" />
          </div>`).join('')}
      </div>
    </div>` : '';

  const strengthsHtml = strengths.length > 0
    ? `<div style="margin-bottom:16px;">
        <p style="font-size:13px;font-weight:700;color:#374151;margin:0 0 8px;">✅ Strengths</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${strengths.map((s) => `<span style="background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${s}</span>`).join('')}
        </div>
      </div>`
    : '';

  const weaknessesHtml = weaknesses.length > 0
    ? `<div>
        <p style="font-size:13px;font-weight:700;color:#374151;margin:0 0 8px;">📈 Areas to Improve</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${weaknesses.map((w) => `<span style="background:#fff7ed;color:#D97706;border:1px solid #fed7aa;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${w}</span>`).join('')}
        </div>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Evaluation Report — ${studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1f2937; padding: 32px; max-width: 960px; margin: 0 auto; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
    }
    h2 { font-size: 18px; font-weight: 800; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb; }
  </style>
</head>
<body>

  <!-- Print button -->
  <div class="no-print" style="text-align:right;margin-bottom:20px;">
    <button onclick="window.print()" style="background:#7C3AED;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
      🖨️ Save as PDF / Print
    </button>
  </div>

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#7C3AED 0%,#06B6D4 100%);color:#fff;border-radius:16px;padding:32px;margin-bottom:28px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <div>
        <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;opacity:0.75;margin-bottom:6px;">Evaluation Report</p>
        <h1 style="font-size:28px;font-weight:900;margin-bottom:8px;">${subject}</h1>
        <p style="font-size:14px;opacity:0.9;">${studentName} &nbsp;·&nbsp; Roll No: ${rollNo} &nbsp;·&nbsp; ${cls}</p>
        <p style="font-size:13px;opacity:0.75;margin-top:4px;">${school} &nbsp;·&nbsp; ${dateStr}</p>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:20px 28px;text-align:center;backdrop-filter:blur(4px);">
        <p style="font-size:42px;font-weight:900;line-height:1;">${pct}%</p>
        <p style="font-size:13px;opacity:0.85;margin-top:4px;">${obt} / ${max} marks</p>
        <p style="font-size:22px;font-weight:900;margin-top:6px;color:${gradeColor === '#059669' ? '#bbf7d0' : gradeColor === '#1A6BFF' ? '#bfdbfe' : gradeColor === '#D97706' ? '#fde68a' : '#fecaca'};">Grade ${grade}</p>
      </div>
    </div>
  </div>

  <!-- Stats row -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">
    ${[
      { label: 'Total Score',    value: `${obt} / ${max}`,  color: '#7C3AED' },
      { label: 'Percentage',     value: `${pct}%`,          color: '#06B6D4' },
      { label: 'Grade',          value: grade,              color: gradeColor },
      { label: 'AI Confidence',  value: `${detail.trainingData?.avgAiConfidence ?? '—'}%`, color: '#6b7280' },
    ].map((s) => `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center;">
        <p style="font-size:24px;font-weight:900;color:${s.color};">${s.value}</p>
        <p style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">${s.label}</p>
      </div>`).join('')}
  </div>

  <!-- Answer sheet images (if any) -->
  ${imagesHtml}

  <!-- Question Breakdown -->
  <div style="margin:32px 0;">
    <h2>📋 Question-by-Question Breakdown</h2>
    <div style="overflow-x:auto;border:1px solid #e5e7eb;border-radius:12px;">
      <table>
        <thead>
          <tr>
            <th>Q No</th>
            <th>Question</th>
            <th style="text-align:center;">Score</th>
            <th style="text-align:center;">AI Score</th>
            <th>AI Feedback</th>
          </tr>
        </thead>
        <tbody>${questionsHtml}</tbody>
      </table>
    </div>
  </div>

  <!-- Performance Analysis -->
  <div style="margin:32px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
    <h2 style="border-bottom-color:#e5e7eb;">🎯 Performance Analysis</h2>
    <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div>${strengthsHtml}</div>
      <div>${weaknessesHtml}</div>
    </div>
    ${weaknesses.length > 0 ? `
    <div style="margin-top:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;">
      <p style="font-size:13px;color:#1d4ed8;"><strong>💡 Tip:</strong> Review your answers for ${weaknesses.slice(0, 2).join(' and ')}. Practice more problems in these areas to improve your score.</p>
    </div>` : `
    <div style="margin-top:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
      <p style="font-size:13px;color:#15803d;"><strong>🌟 Excellent!</strong> You've demonstrated strong understanding across all topics. Keep up the great work!</p>
    </div>`}
  </div>

  <!-- Footer -->
  <div style="margin-top:40px;text-align:center;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="font-size:12px;color:#9ca3af;">Generated by <strong>Eval AI</strong> &nbsp;·&nbsp; ${new Date().toLocaleString('en-IN')}</p>
  </div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

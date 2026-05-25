/**
 * Professional evaluation report generator.
 * Builds a rich HTML document (A4-style) and opens it for print/PDF.
 * Shared by teacher (ScoreSummaryPanel) and student (Results page).
 */

export interface ReportQuestion {
  qNo?: string | number;
  section?: string;
  questionText?: string;
  aiAnswer?: string;      // model / correct answer
  ocrText?: string;       // student's handwritten answer (OCR)
  maxMarks: number;
  aiScore?: number;
  teacherScore?: number | null;
  aiReasoning?: string;
  aiConfidence?: number;
  keyPoints?: { point: string; covered: boolean; partial: boolean }[];
  hasDiagram?: boolean;
  language?: string;
  status?: string;
}

export interface ReportDetail {
  studentInfo?: Record<string, any>;
  paperInfo?:   Record<string, any>;
  questions?:   ReportQuestion[];
  trainingData?: Record<string, any>;
  scannedImages?: string[];
  behaviorAnalysis?: any;
  createdAt?: string;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function grade(pct: number) {
  if (pct >= 90) return { g: 'A+', hex: '#059669', bg: '#d1fae5' };
  if (pct >= 80) return { g: 'A',  hex: '#059669', bg: '#d1fae5' };
  if (pct >= 70) return { g: 'B+', hex: '#1d4ed8', bg: '#dbeafe' };
  if (pct >= 60) return { g: 'B',  hex: '#1d4ed8', bg: '#dbeafe' };
  if (pct >= 50) return { g: 'C',  hex: '#d97706', bg: '#fef3c7' };
  if (pct >= 40) return { g: 'D',  hex: '#ea580c', bg: '#ffedd5' };
  return              { g: 'F',  hex: '#dc2626', bg: '#fee2e2' };
}

function esc(s: string | undefined | null) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function scoreColor(pct: number) {
  if (pct >= 80) return '#059669';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
}

/* ── Section builders ──────────────────────────────────────────────────────── */

function buildHeader(detail: ReportDetail, obt: number, max: number, pct: number) {
  const { g, hex, bg } = grade(pct);
  const name    = esc(detail.studentInfo?.name ?? '—');
  const rollNo  = esc(detail.studentInfo?.rollNo ?? '—');
  const cls     = esc(detail.studentInfo?.class ?? detail.studentInfo?.studentClass ?? '—');
  const school  = esc(detail.studentInfo?.school ?? '—');
  const subject = esc(detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? '—');
  const board   = esc(detail.studentInfo?.board ?? '');
  const dateStr = detail.createdAt
    ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const avgConf = detail.trainingData?.avgAiConfidence;

  return `
  <div class="report-header">
    <div class="header-left">
      <div class="header-logo">
        <span class="logo-icon">✦</span>
        <div>
          <div class="logo-title">Eval AI</div>
          <div class="logo-sub">Evaluation Report</div>
        </div>
      </div>
      <h1 class="subject-title">${subject}</h1>
      <div class="student-meta">
        <div class="meta-row"><span class="meta-label">Student</span><span class="meta-val">${name}</span></div>
        <div class="meta-row"><span class="meta-label">Roll No</span><span class="meta-val">${rollNo}</span></div>
        <div class="meta-row"><span class="meta-label">Class</span><span class="meta-val">${cls}${board ? ' · ' + board : ''}</span></div>
        <div class="meta-row"><span class="meta-label">School</span><span class="meta-val">${school}</span></div>
        <div class="meta-row"><span class="meta-label">Date</span><span class="meta-val">${dateStr}</span></div>
      </div>
    </div>
    <div class="header-right">
      <div class="score-card">
        <div class="score-pct" style="color:${hex}">${pct}%</div>
        <div class="score-raw">${obt} / ${max} marks</div>
        <div class="grade-badge" style="color:${hex};background:${bg}">Grade ${g}</div>
        ${avgConf != null ? `<div class="conf-bar-wrap"><div class="conf-label">AI Confidence</div><div class="conf-bar-bg"><div class="conf-bar-fill" style="width:${avgConf}%;background:${hex}"></div></div><div class="conf-val">${avgConf}%</div></div>` : ''}
      </div>
      <div class="stats-grid">
        ${[
          { label: 'Total Score',   val: `${obt}/${max}` },
          { label: 'Percentage',    val: `${pct}%` },
          { label: 'Grade',         val: g },
          { label: 'Questions',     val: String(detail.questions?.length ?? 0) },
        ].map(({ label, val }) => `
          <div class="stat-cell">
            <div class="stat-val">${val}</div>
            <div class="stat-label">${label}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function buildAnswerSheet(images: string[]) {
  if (!images.length) return '';
  return `
  <div class="section page-break-before">
    <div class="section-header purple">
      <span class="section-icon">📝</span>
      <span>Answer Sheet — Scanned Pages</span>
    </div>
    <div class="images-grid">
      ${images.map((src, i) => `
        <div class="img-wrap">
          <div class="img-label">Page ${i + 1}</div>
          <img src="${src}" alt="Page ${i + 1}" class="sheet-img" />
        </div>`).join('')}
    </div>
  </div>`;
}

function buildQuestions(questions: ReportQuestion[]) {
  if (!questions.length) return '';

  const rows = questions.map((q, i) => {
    const score    = q.teacherScore ?? q.aiScore ?? 0;
    const qPct     = q.maxMarks > 0 ? (score / q.maxMarks) * 100 : 0;
    const col      = scoreColor(qPct);
    const override = q.teacherScore !== null && q.teacherScore !== undefined && q.teacherScore !== q.aiScore;
    const covered  = q.keyPoints?.filter((k) => k.covered).length ?? 0;
    const total    = q.keyPoints?.length ?? 0;

    return `
    <div class="q-card">
      <div class="q-header">
        <div class="q-num">Q${q.qNo ?? i + 1}${q.section ? ' <span class="q-sec">§${esc(q.section)}</span>' : ''}</div>
        <div class="q-score-wrap">
          ${override ? `<span class="override-tag">Teacher: ${q.teacherScore} <span style="opacity:.6">(AI: ${q.aiScore})</span></span>` : ''}
          <span class="q-score" style="color:${col};border-color:${col}">${score} / ${q.maxMarks}</span>
          ${q.aiConfidence != null ? `<span class="conf-tag">${q.aiConfidence}% conf</span>` : ''}
        </div>
      </div>

      ${q.questionText ? `<div class="q-question"><span class="q-field-label">❓ Question</span><p class="q-text">${esc(q.questionText)}</p></div>` : ''}

      <div class="q-answers-grid">
        ${q.ocrText ? `
        <div class="answer-box student-box">
          <div class="answer-box-label">✍️ Student's Answer (OCR)</div>
          <p class="answer-text">${esc(q.ocrText)}</p>
          ${q.hasDiagram ? '<div class="diagram-tag">📊 Contains diagram / figure</div>' : ''}
          ${q.language && q.language !== 'English' ? `<div class="lang-tag">🌐 Language: ${esc(q.language)}</div>` : ''}
        </div>` : ''}
        ${q.aiAnswer ? `
        <div class="answer-box ai-box">
          <div class="answer-box-label">🤖 Model Answer (AI)</div>
          <p class="answer-text">${esc(q.aiAnswer)}</p>
        </div>` : ''}
      </div>

      ${q.aiReasoning ? `
      <div class="q-feedback">
        <span class="q-field-label">💬 Evaluation Feedback</span>
        <p class="feedback-text">${esc(q.aiReasoning)}</p>
      </div>` : ''}

      ${total > 0 ? `
      <div class="q-keypoints">
        <span class="q-field-label">🔑 Key Points Coverage (${covered}/${total})</span>
        <div class="kp-list">
          ${q.keyPoints!.map((k) => `
            <span class="kp-tag ${k.covered ? 'kp-ok' : k.partial ? 'kp-partial' : 'kp-miss'}">
              ${k.covered ? '✓' : k.partial ? '◑' : '✗'} ${esc(k.point)}
            </span>`).join('')}
        </div>
      </div>` : ''}
    </div>`;
  });

  return `
  <div class="section page-break-before">
    <div class="section-header blue">
      <span class="section-icon">📋</span>
      <span>Question-by-Question Analysis</span>
      <span class="section-count">${questions.length} questions</span>
    </div>
    ${rows.join('')}
  </div>`;
}

function buildPerformance(questions: ReportQuestion[], detail: ReportDetail) {
  const STOP = new Set(['the','a','an','if','is','are','what','find','which','of','and','in','for','to','that','then','given','let','be','where','such','show','prove','when','on','with','by','from','it','at','as','or']);

  const getSkill = (q: ReportQuestion) => {
    const reasoning = (q.aiReasoning ?? '').replace(/^(correctly|incorrectly|partially)\s+/i, '').split(/[,.\-–]/)[0].trim();
    if (reasoning.length > 4 && reasoning.length < 60) return reasoning.charAt(0).toUpperCase() + reasoning.slice(1);
    const words = (q.questionText ?? '').split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter((w) => w.length > 3 && !STOP.has(w.toLowerCase()));
    return words.slice(0, 3).join(' ') || `Q${q.qNo}`;
  };

  const strengths  = questions.filter((q) => { const s = q.teacherScore ?? q.aiScore ?? 0; return q.maxMarks > 0 && (s / q.maxMarks) >= 0.8; }).map(getSkill).filter((s, i, a) => a.indexOf(s) === i).slice(0, 6);
  const weaknesses = questions.filter((q) => { const s = q.teacherScore ?? q.aiScore ?? 0; return q.maxMarks > 0 && (s / q.maxMarks) < 0.6; }).map(getSkill).filter((s, i, a) => a.indexOf(s) === i).slice(0, 5);
  const avgScore   = detail.trainingData?.totalMax > 0 ? Math.round((detail.trainingData.totalObtained / detail.trainingData.totalMax) * 100) : 0;

  const sectionRows = Array.from(new Set(questions.map((q) => q.section))).filter(Boolean).map((sec) => {
    const qs  = questions.filter((q) => q.section === sec);
    const obt = qs.reduce((s, q) => s + (q.teacherScore ?? q.aiScore ?? 0), 0);
    const mx  = qs.reduce((s, q) => s + q.maxMarks, 0);
    const p   = mx > 0 ? Math.round((obt / mx) * 100) : 0;
    return `<tr><td class="tbl-td">${esc(sec ?? '')}</td><td class="tbl-td">${qs.length} Qs</td><td class="tbl-td">${obt}/${mx}</td><td class="tbl-td"><div style="display:flex;align-items:center;gap:8px;"><div style="flex:1;background:#e5e7eb;border-radius:4px;height:6px;"><div style="width:${p}%;height:6px;border-radius:4px;background:${scoreColor(p)}"></div></div><span style="font-weight:700;color:${scoreColor(p)};font-size:12px">${p}%</span></div></td></tr>`;
  });

  return `
  <div class="section page-break-before">
    <div class="section-header green">
      <span class="section-icon">🎯</span>
      <span>Performance Analysis</span>
    </div>
    <div class="perf-grid">
      <div class="perf-block">
        <div class="perf-block-title">✅ Strengths</div>
        ${strengths.length ? `<div class="tag-cloud">${strengths.map((s) => `<span class="tag tag-green">${esc(s)}</span>`).join('')}</div>` : '<p class="no-data">Data pending evaluation</p>'}
      </div>
      <div class="perf-block">
        <div class="perf-block-title">📈 Areas to Improve</div>
        ${weaknesses.length ? `<div class="tag-cloud">${weaknesses.map((w) => `<span class="tag tag-amber">${esc(w)}</span>`).join('')}</div>` : '<p class="no-data">Great — no significant weak areas!</p>'}
      </div>
    </div>

    ${sectionRows.length ? `
    <div class="subsection-title">Section Breakdown</div>
    <table class="data-table">
      <thead><tr><th>Section</th><th>Questions</th><th>Score</th><th>Performance</th></tr></thead>
      <tbody>${sectionRows.join('')}</tbody>
    </table>` : ''}

    <div class="tip-box ${weaknesses.length > 0 ? 'tip-amber' : 'tip-green'}">
      ${weaknesses.length > 0
        ? `<strong>💡 Recommendation:</strong> Review your answers for <em>${weaknesses.slice(0, 2).join('</em> and <em>')}</em>. Practise similar problems to improve your understanding of these topics.`
        : `<strong>🌟 Excellent Performance!</strong> You have demonstrated strong understanding across all evaluated topics. Keep maintaining this standard.`}
    </div>
  </div>`;
}

function buildBehavior(ba: any) {
  if (!ba) return '';

  const sb = ba.subjectBehavior ?? {};
  const hw = ba.handwritingFeatures;
  const oi = ba.overallInsights ?? {};
  const es = ba.emotionalSignals;
  const lbi = ba.learningBehaviorInsights;
  const pp  = ba.personalityProfile;

  const kpiCards = [
    { label: 'Avg Score',      val: `${sb.avgScore ?? '—'}%` },
    { label: 'Difficult Qs',   val: String(sb.difficultTopics?.length ?? 0) },
    { label: 'Diagram Usage',  val: `${sb.diagramUsageRate ?? 0}%` },
    { label: 'Answer Pattern', val: sb.answerLengthPattern ?? '—' },
  ].map(({ label, val }) => `
    <div class="kpi-card">
      <div class="kpi-val">${val}</div>
      <div class="kpi-label">${label}</div>
    </div>`).join('');

  const difficultyRows = [
    { label: 'Easy',     items: sb.easyTopics ?? [],     color: '#059669', bg: '#d1fae5' },
    { label: 'Medium',   items: sb.mediumTopics ?? [],   color: '#d97706', bg: '#fef3c7' },
    { label: 'Difficult',items: sb.difficultTopics ?? [],color: '#dc2626', bg: '#fee2e2' },
  ].map(({ label, items, color, bg }) => `
    <tr>
      <td class="tbl-td"><span style="background:${bg};color:${color};padding:2px 8px;border-radius:4px;font-weight:700;font-size:11px;">${label}</span></td>
      <td class="tbl-td">${items.length > 0 ? esc(items.join(', ')) : '<span style="color:#9ca3af;font-style:italic">None</span>'}</td>
      <td class="tbl-td" style="text-align:center;font-weight:700;">${items.length}</td>
    </tr>`).join('');

  const hwSection = hw ? `
    <div class="subsection-title">✍️ Handwriting Analysis</div>
    <div class="hw-grid">
      <div class="hw-block">
        <div class="hw-block-title">Stroke Characteristics</div>
        ${[
          ['Baseline',      hw.baselineAngle?.label,   hw.baselineAngle?.direction],
          ['Slant',         hw.slant?.label,            null],
          ['Pressure',      hw.pressure?.label,         `${hw.pressure?.intensity ?? ''}/100`],
          ['Letter Size',   hw.letterSize?.label,       `var: ${hw.letterSize?.variance ?? ''}`],
          ['Stroke Rhythm', hw.strokeRhythm?.label,     hw.strokeRhythm?.flowPattern],
        ].map(([l, v, s]) => `
          <div class="hw-row">
            <span class="hw-label">${l}</span>
            <span class="hw-val">${esc(v ?? '—')}${s ? ` <span class="hw-sub">(${esc(s)})</span>` : ''}</span>
          </div>`).join('')}
      </div>
      <div class="hw-block">
        <div class="hw-block-title">Spacing &amp; Layout</div>
        ${[
          ['Word Spacing', hw.wordSpacing?.label,   null],
          ['Line Spacing', hw.lineSpacing?.label,   hw.lineSpacing?.consistency],
          ['Margins',      hw.margins?.label,       null],
          ['Corrections',  hw.corrections?.label,   hw.corrections?.pattern],
        ].map(([l, v, s]) => `
          <div class="hw-row">
            <span class="hw-label">${l}</span>
            <span class="hw-val">${esc(v ?? '—')}${s ? ` <span class="hw-sub">(${esc(s)})</span>` : ''}</span>
          </div>`).join('')}
      </div>
      <div class="hw-block">
        <div class="hw-block-title">Writing Zones</div>
        <p style="font-size:11px;color:#6b7280;margin-bottom:10px;">Dominant: <strong>${esc(hw.writingZones?.dominant ?? '—')}</strong></p>
        ${[
          { label: 'Upper',  pct: hw.writingZones?.upperPercent  ?? 0, color: '#a855f7' },
          { label: 'Middle', pct: hw.writingZones?.middlePercent ?? 0, color: '#6366f1' },
          { label: 'Lower',  pct: hw.writingZones?.lowerPercent  ?? 0, color: '#3b82f6' },
        ].map(({ label, pct, color }) => `
          <div class="zone-row">
            <span class="zone-label">${label}</span>
            <div class="zone-bar-bg"><div class="zone-bar-fill" style="width:${pct}%;background:${color}"></div></div>
            <span class="zone-pct">${pct}%</span>
          </div>`).join('')}
        <div style="margin-top:10px;font-size:10px;color:#9ca3af;line-height:1.6">
          Upper → imagination &amp; aspirations<br/>Middle → everyday focus &amp; practicality<br/>Lower → energy &amp; physical drive
        </div>
      </div>
    </div>` : '';

  const esSection = es ? `
    <div class="subsection-title">💭 Emotional State Signals</div>
    <div class="es-grid">
      ${[
        { label: 'Stress',      level: es.stressIndicators?.level,      signal: es.stressIndicators?.signals?.[0] },
        { label: 'Confidence',  level: es.confidenceIndicators?.level,  signal: es.confidenceIndicators?.signals?.[0] },
        { label: 'Hesitation',  level: es.hesitationIndicators?.level,  signal: es.hesitationIndicators?.signals?.[0] },
      ].map(({ label, level, signal }) => {
        const lmap: Record<string, string> = { low: '#6b7280', 'low-moderate': '#3b82f6', moderate: '#d97706', 'moderate-high': '#059669', high: '#16a34a', medium: '#d97706' };
        const col = lmap[level ?? ''] ?? '#6b7280';
        return `
        <div class="es-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:12px;font-weight:700;color:#374151;">${label}</span>
            <span style="font-size:11px;font-weight:600;color:${col};text-transform:capitalize;">${level ?? '—'}</span>
          </div>
          ${signal ? `<p style="font-size:11px;color:#6b7280;line-height:1.5;">${esc(signal)}</p>` : ''}
        </div>`;
      }).join('')}
    </div>` : '';

  const lbiSection = lbi ? `
    <div class="subsection-title">🧠 Learning Insights</div>
    <div class="lbi-block">
      ${lbi.subjectSpecific ? `<p class="lbi-para indigo">${esc(lbi.subjectSpecific)}</p>` : ''}
      ${lbi.answerPatterns  ? `<p class="lbi-para purple">${esc(lbi.answerPatterns)}</p>` : ''}
      ${lbi.examStrategy    ? `<p class="lbi-para slate">${esc(lbi.examStrategy)}</p>` : ''}
    </div>` : '';

  const ppSection = pp ? `
    <div class="subsection-title">📊 Behavior Signals</div>
    <div class="pp-grid">
      ${pp.traits?.map((t: any) => `
        <div class="pp-trait">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:12px;color:#374151;">${esc(t.name)}</span>
            <span style="font-size:11px;font-weight:600;color:#6366f1;">${t.score}/100</span>
          </div>
          <div class="trait-bar-bg"><div class="trait-bar-fill" style="width:${t.score}%"></div></div>
        </div>`).join('')}
    </div>
    <div class="pp-styles">
      ${[
        { label: 'Communication', val: pp.communicationStyle },
        { label: 'Thinking',      val: pp.thinkingStyle },
        { label: 'Work Style',    val: pp.workStyle },
        { label: 'Social',        val: pp.socialStyle },
      ].map(({ label, val }) => `
        <div class="pp-style-card">
          <div class="pp-style-label">${label}</div>
          <div class="pp-style-val">${esc((val ?? '—').replace(/-/g, ' '))}</div>
        </div>`).join('')}
    </div>` : '';

  const guidanceSection = `
    <div class="subsection-title">📌 Guidance &amp; Recommendations</div>
    <div class="guidance-grid">
      ${oi.strengths?.length ? `
      <div class="guidance-card green-card">
        <div class="guidance-card-title">✅ Strengths Observed</div>
        <ul class="guidance-list">${oi.strengths.map((s: string) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>` : ''}
      ${oi.growthAreas?.length ? `
      <div class="guidance-card amber-card">
        <div class="guidance-card-title">📈 Growth Areas</div>
        <ul class="guidance-list">${oi.growthAreas.map((g: string) => `<li>${esc(g)}</li>`).join('')}</ul>
      </div>` : ''}
      ${oi.recommendations?.length ? `
      <div class="guidance-card blue-card">
        <div class="guidance-card-title">💡 Recommendations</div>
        <ul class="guidance-list">${oi.recommendations.map((r: string) => `<li>${esc(r)}</li>`).join('')}</ul>
      </div>` : ''}
      ${lbi?.studyStyleIndicators?.length ? `
      <div class="guidance-card purple-card">
        <div class="guidance-card-title">📚 Study Style</div>
        <ul class="guidance-list">${lbi.studyStyleIndicators.map((s: string) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>` : ''}
    </div>`;

  return `
  <div class="section page-break-before">
    <div class="section-header indigo">
      <span class="section-icon">🧠</span>
      <span>Learning Behavior Intelligence Report</span>
      <span class="section-sub">Observational signals — not clinical diagnoses</span>
    </div>

    <div class="kpi-row">${kpiCards}</div>

    ${difficultyRows ? `
    <div class="subsection-title">📊 Subject Difficulty Map</div>
    <table class="data-table">
      <thead><tr><th>Difficulty</th><th>Topics / Questions</th><th>Count</th></tr></thead>
      <tbody>${difficultyRows}</tbody>
    </table>` : ''}

    ${hwSection}
    ${esSection}
    ${lbiSection}
    ${ppSection}
    ${guidanceSection}
  </div>`;
}

/* ── CSS ───────────────────────────────────────────────────────────────────── */

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',system-ui,Arial,sans-serif;background:#fff;color:#1f2937;padding:32px;max-width:1000px;margin:0 auto;font-size:13px;line-height:1.6;}
  @media print{body{padding:12px;max-width:100%;}@page{margin:15mm;}.page-break-before{page-break-before:always;}.no-print{display:none!important;}table{page-break-inside:auto;}tr,div.q-card{page-break-inside:avoid;}}
  /* Header */
  .report-header{display:flex;justify-content:space-between;gap:24px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1d4ed8 100%);color:#fff;border-radius:16px;padding:32px;margin-bottom:28px;flex-wrap:wrap;}
  .header-logo{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
  .logo-icon{font-size:24px;background:rgba(255,255,255,.15);border-radius:8px;padding:6px 10px;}
  .logo-title{font-size:18px;font-weight:900;letter-spacing:.05em;}
  .logo-sub{font-size:10px;opacity:.65;text-transform:uppercase;letter-spacing:.1em;}
  .subject-title{font-size:26px;font-weight:900;margin-bottom:14px;line-height:1.2;}
  .meta-row{display:flex;gap:10px;margin-bottom:3px;}
  .meta-label{font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:.05em;width:60px;flex-shrink:0;}
  .meta-val{font-size:12px;font-weight:600;}
  .header-right{display:flex;flex-direction:column;gap:16px;align-items:flex-end;min-width:200px;}
  .score-card{background:rgba(255,255,255,.12);border-radius:12px;padding:20px 24px;text-align:center;backdrop-filter:blur(4px);}
  .score-pct{font-size:48px;font-weight:900;line-height:1;}
  .score-raw{font-size:13px;opacity:.8;margin-top:4px;}
  .grade-badge{display:inline-block;margin-top:8px;font-size:18px;font-weight:900;padding:4px 16px;border-radius:8px;}
  .conf-bar-wrap{margin-top:10px;}
  .conf-label{font-size:10px;opacity:.6;margin-bottom:3px;}
  .conf-bar-bg{background:rgba(255,255,255,.2);border-radius:4px;height:4px;}
  .conf-bar-fill{height:4px;border-radius:4px;}
  .conf-val{font-size:11px;opacity:.8;margin-top:2px;}
  .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
  .stat-cell{background:rgba(255,255,255,.1);border-radius:8px;padding:10px;text-align:center;}
  .stat-val{font-size:18px;font-weight:900;}
  .stat-label{font-size:9px;opacity:.6;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;}
  /* Section */
  .section{margin-bottom:32px;}
  .section-header{display:flex;align-items:center;gap:10px;padding:12px 20px;border-radius:10px;margin-bottom:20px;font-size:15px;font-weight:800;color:#fff;flex-wrap:wrap;}
  .section-header.purple{background:linear-gradient(135deg,#7c3aed,#6d28d9);}
  .section-header.blue{background:linear-gradient(135deg,#1d4ed8,#2563eb);}
  .section-header.green{background:linear-gradient(135deg,#059669,#10b981);}
  .section-header.indigo{background:linear-gradient(135deg,#4f46e5,#7c3aed);}
  .section-icon{font-size:18px;}
  .section-count{font-size:11px;opacity:.75;margin-left:auto;background:rgba(255,255,255,.2);padding:2px 8px;border-radius:12px;}
  .section-sub{font-size:10px;opacity:.65;margin-left:auto;font-style:italic;}
  /* Images */
  .images-grid{display:flex;flex-wrap:wrap;gap:16px;}
  .img-wrap{flex:1 1 45%;min-width:260px;page-break-inside:avoid;}
  .img-label{font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;}
  .sheet-img{width:100%;border:1px solid #e5e7eb;border-radius:8px;display:block;}
  /* Q Card */
  .q-card{border:1px solid #e5e7eb;border-radius:12px;margin-bottom:16px;overflow:hidden;page-break-inside:avoid;}
  .q-header{display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:10px 16px;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;gap:8px;}
  .q-num{font-size:14px;font-weight:900;color:#1d4ed8;}
  .q-sec{font-size:11px;color:#6b7280;font-weight:600;}
  .q-score-wrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .q-score{font-size:14px;font-weight:900;border:2px solid;padding:2px 10px;border-radius:20px;}
  .override-tag{font-size:11px;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:4px;font-weight:600;}
  .conf-tag{font-size:10px;color:#6b7280;background:#f3f4f6;padding:2px 6px;border-radius:4px;}
  .q-question{padding:10px 16px;border-bottom:1px solid #f3f4f6;}
  .q-field-label{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px;}
  .q-text{font-size:13px;color:#374151;font-weight:600;line-height:1.5;}
  .q-answers-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #f3f4f6;}
  .answer-box{padding:12px 16px;}
  .student-box{background:#fffbeb;border-right:1px solid #fde68a;}
  .ai-box{background:#f0fdf4;}
  .answer-box-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;color:#6b7280;}
  .student-box .answer-box-label{color:#b45309;}
  .ai-box .answer-box-label{color:#15803d;}
  .answer-text{font-size:12px;color:#374151;line-height:1.6;}
  .diagram-tag,.lang-tag{font-size:10px;margin-top:6px;color:#7c3aed;background:#f5f3ff;padding:2px 8px;border-radius:4px;display:inline-block;}
  .q-feedback{padding:10px 16px;background:#fafafa;border-bottom:1px solid #f3f4f6;}
  .feedback-text{font-size:12px;color:#4b5563;line-height:1.6;font-style:italic;}
  .q-keypoints{padding:10px 16px;}
  .kp-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
  .kp-tag{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;}
  .kp-ok{background:#d1fae5;color:#065f46;}
  .kp-partial{background:#fef3c7;color:#92400e;}
  .kp-miss{background:#fee2e2;color:#991b1b;}
  /* Performance */
  .perf-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
  .perf-block{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;}
  .perf-block-title{font-size:13px;font-weight:700;color:#374151;margin-bottom:10px;}
  .tag-cloud{display:flex;flex-wrap:wrap;gap:8px;}
  .tag{font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;}
  .tag-green{background:#d1fae5;color:#059669;border:1px solid #a7f3d0;}
  .tag-amber{background:#fef3c7;color:#d97706;border:1px solid #fde68a;}
  .no-data{font-size:12px;color:#9ca3af;font-style:italic;}
  .subsection-title{font-size:13px;font-weight:800;color:#374151;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #e5e7eb;}
  .tip-box{padding:14px 16px;border-radius:10px;font-size:13px;margin-top:16px;line-height:1.6;}
  .tip-amber{background:#fffbeb;border:1px solid #fde68a;color:#92400e;}
  .tip-green{background:#f0fdf4;border:1px solid #bbf7d0;color:#14532d;}
  /* Tables */
  .data-table{width:100%;border-collapse:collapse;font-size:12px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;}
  .data-table thead tr{background:#f8fafc;}
  .data-table th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;}
  .tbl-td{padding:10px 14px;border-bottom:1px solid #f3f4f6;color:#374151;}
  /* Behavior */
  .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  .kpi-card{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-radius:10px;padding:14px;text-align:center;}
  .kpi-val{font-size:20px;font-weight:900;text-transform:capitalize;}
  .kpi-label{font-size:10px;opacity:.7;text-transform:uppercase;letter-spacing:.05em;margin-top:3px;}
  .hw-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;}
  .hw-block{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:14px;}
  .hw-block-title{font-size:12px;font-weight:700;color:#374151;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;}
  .hw-row{display:flex;justify-content:space-between;align-items:flex-start;padding:4px 0;border-bottom:1px solid #f1f5f9;}
  .hw-label{font-size:11px;color:#6b7280;}
  .hw-val{font-size:11px;font-weight:600;color:#374151;text-align:right;}
  .hw-sub{font-size:10px;color:#9ca3af;font-weight:400;}
  .zone-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
  .zone-label{font-size:11px;color:#6b7280;width:50px;}
  .zone-bar-bg{flex:1;background:#e5e7eb;border-radius:4px;height:8px;}
  .zone-bar-fill{height:8px;border-radius:4px;}
  .zone-pct{font-size:11px;color:#6b7280;width:30px;text-align:right;}
  .es-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;}
  .es-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:14px;}
  .lbi-block{background:#f5f3ff;border:1px solid #e0e7ff;border-radius:10px;padding:16px;margin-bottom:16px;}
  .lbi-para{font-size:12px;line-height:1.7;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06);}
  .lbi-para:last-child{border:none;}
  .lbi-para.indigo{color:#3730a3;}
  .lbi-para.purple{color:#6b21a8;}
  .lbi-para.slate{color:#475569;}
  .pp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;}
  .pp-trait{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;}
  .trait-bar-bg{background:#e5e7eb;border-radius:4px;height:6px;}
  .trait-bar-fill{height:6px;border-radius:4px;background:#6366f1;}
  .pp-styles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;}
  .pp-style-card{background:#eef2ff;border-radius:8px;padding:10px;text-align:center;}
  .pp-style-label{font-size:10px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;}
  .pp-style-val{font-size:12px;font-weight:700;color:#3730a3;text-transform:capitalize;}
  .guidance-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  .guidance-card{border-radius:10px;padding:16px;}
  .green-card{background:#f0fdf4;border:1px solid #bbf7d0;}
  .amber-card{background:#fffbeb;border:1px solid #fde68a;}
  .blue-card{background:#eff6ff;border:1px solid #bfdbfe;}
  .purple-card{background:#f5f3ff;border:1px solid #e0e7ff;}
  .guidance-card-title{font-size:13px;font-weight:800;margin-bottom:10px;color:#374151;}
  .guidance-list{padding-left:0;list-style:none;}
  .guidance-list li{font-size:12px;color:#4b5563;padding:3px 0 3px 16px;position:relative;line-height:1.5;}
  .guidance-list li::before{content:'▸';position:absolute;left:0;color:#9ca3af;}
  /* Print button */
  .print-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding:12px 16px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;}
  .print-btn{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;}
  .print-meta{font-size:12px;color:#9ca3af;}
  /* Footer */
  .report-footer{margin-top:40px;padding-top:16px;border-top:2px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:11px;}
`;

/* ── Main export ───────────────────────────────────────────────────────────── */

export function downloadEvalReport(detail: ReportDetail, scannedImages?: string[]) {
  const qs  = detail.questions ?? [];
  const obt = detail.trainingData?.totalObtained ?? qs.reduce((s, q) => s + (q.teacherScore ?? q.aiScore ?? 0), 0);
  const max = detail.trainingData?.totalMax ?? detail.paperInfo?.totalMarks ?? qs.reduce((s, q) => s + q.maxMarks, 0);
  const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
  const imgs = scannedImages ?? detail.scannedImages ?? [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Evaluation Report — ${esc(detail.studentInfo?.name ?? 'Student')}</title>
<style>${CSS}</style>
</head>
<body>
<div class="print-bar no-print">
  <div class="print-meta">
    Eval AI &nbsp;·&nbsp; ${esc(detail.studentInfo?.name ?? '—')} &nbsp;·&nbsp; ${esc(detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? '—')}
  </div>
  <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
</div>

${buildHeader(detail, obt, max, pct)}
${buildAnswerSheet(imgs)}
${buildQuestions(qs)}
${buildPerformance(qs, detail)}
${buildBehavior(detail.behaviorAnalysis)}

<div class="report-footer">
  Generated by <strong>Eval AI</strong> &nbsp;·&nbsp; ${new Date().toLocaleString('en-IN')} &nbsp;·&nbsp; Confidential — For student and teacher use only
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1100,height=900,scrollbars=yes');
  if (win) { win.document.write(html); win.document.close(); }
}

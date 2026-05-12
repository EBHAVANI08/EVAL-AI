import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();

    const [totalCount, evaluations] = await Promise.all([
      db.collection('evaluations').countDocuments(),
      db.collection('evaluations').find({}).sort({ createdAt: -1 }).limit(500).toArray(),
    ]);

    if (evaluations.length === 0) {
      return NextResponse.json({
        totalEvaluations: 0,
        avgConfidence: 0,
        avgScore: 0,
        overrideRate: 0,
        passRate: 0,
        finalizedCount: 0,
        subjectStats: [],
        scoreDistribution: [],
        monthlyTrend: [],
        topStudents: [],
        confidenceDistribution: [
          { label: 'Low (<70%)', count: 0 },
          { label: 'Medium (70-85%)', count: 0 },
          { label: 'High (>85%)', count: 0 },
        ],
      });
    }

    const finalizedCount = evaluations.filter((e) => e.status === 'finalized').length;

    const confEvals = evaluations.filter((e) => e.trainingData?.avgAiConfidence != null);
    const avgConfidence = confEvals.length
      ? Math.round(confEvals.reduce((s, e) => s + e.trainingData.avgAiConfidence, 0) / confEvals.length)
      : 0;

    const scoredEvals = evaluations.filter(
      (e) => e.trainingData?.totalMax > 0 && e.trainingData?.totalObtained != null
    );
    const avgScore = scoredEvals.length
      ? Math.round(
          scoredEvals.reduce(
            (s, e) => s + (e.trainingData.totalObtained / e.trainingData.totalMax) * 100,
            0
          ) / scoredEvals.length
        )
      : 0;

    const totalOverrides = evaluations.reduce((s, e) => s + (e.trainingData?.overrideCount || 0), 0);
    const totalQuestions = evaluations.reduce((s, e) => s + (e.questions?.length || 0), 0);
    const overrideRate = totalQuestions > 0 ? Math.round((totalOverrides / totalQuestions) * 100) : 0;

    const PASS_THRESHOLD = 33;
    const passCount = scoredEvals.filter(
      (e) => (e.trainingData.totalObtained / e.trainingData.totalMax) * 100 >= PASS_THRESHOLD
    ).length;
    const passRate = scoredEvals.length ? Math.round((passCount / scoredEvals.length) * 100) : 0;

    // Score distribution buckets
    const buckets = [
      { label: '0-33%', min: 0, max: 33, count: 0 },
      { label: '33-50%', min: 33, max: 50, count: 0 },
      { label: '50-60%', min: 50, max: 60, count: 0 },
      { label: '60-75%', min: 60, max: 75, count: 0 },
      { label: '75-90%', min: 75, max: 90, count: 0 },
      { label: '90-100%', min: 90, max: 101, count: 0 },
    ];
    scoredEvals.forEach((e) => {
      const pct = (e.trainingData.totalObtained / e.trainingData.totalMax) * 100;
      const bucket = buckets.find((b) => pct >= b.min && pct < b.max);
      if (bucket) bucket.count++;
    });
    const scoreDistribution = buckets.map(({ label, count }) => ({ label, count }));

    // Subject stats
    const subjectMap: Record<string, { total: number; sumPct: number; sumConf: number; overrides: number }> = {};
    scoredEvals.forEach((e) => {
      const subj = e.studentInfo?.subject || e.paperInfo?.subject || 'Unknown';
      if (!subjectMap[subj]) subjectMap[subj] = { total: 0, sumPct: 0, sumConf: 0, overrides: 0 };
      subjectMap[subj].total++;
      subjectMap[subj].sumPct += (e.trainingData.totalObtained / e.trainingData.totalMax) * 100;
      subjectMap[subj].sumConf += e.trainingData.avgAiConfidence || 0;
      subjectMap[subj].overrides += e.trainingData.overrideCount || 0;
    });
    const subjectStats = Object.entries(subjectMap)
      .map(([subject, d]) => ({
        subject,
        count: d.total,
        avgScore: Math.round(d.sumPct / d.total),
        avgConfidence: Math.round(d.sumConf / d.total),
        overrides: d.overrides,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Monthly trend (last 6 months)
    const monthlyMap: Record<string, { count: number; sumConf: number; sumScore: number; scored: number }> = {};
    evaluations.forEach((e) => {
      if (!e.createdAt) return;
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { count: 0, sumConf: 0, sumScore: 0, scored: 0 };
      monthlyMap[key].count++;
      if (e.trainingData?.avgAiConfidence != null)
        monthlyMap[key].sumConf += e.trainingData.avgAiConfidence;
      if (e.trainingData?.totalMax > 0 && e.trainingData?.totalObtained != null) {
        monthlyMap[key].sumScore += (e.trainingData.totalObtained / e.trainingData.totalMax) * 100;
        monthlyMap[key].scored++;
      }
    });
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        count: d.count,
        avgConfidence: d.count > 0 ? Math.round(d.sumConf / d.count) : 0,
        avgScore: d.scored > 0 ? Math.round(d.sumScore / d.scored) : 0,
      }));

    // Top students
    const studentMap: Record<string, { name: string; rollNo: string; total: number; sumPct: number }> = {};
    scoredEvals.forEach((e) => {
      const key = e.studentInfo?.rollNo || e.studentInfo?.name || 'unknown';
      if (!studentMap[key])
        studentMap[key] = { name: e.studentInfo?.name || '—', rollNo: key, total: 0, sumPct: 0 };
      studentMap[key].total++;
      studentMap[key].sumPct += (e.trainingData.totalObtained / e.trainingData.totalMax) * 100;
    });
    const topStudents = Object.values(studentMap)
      .map((s) => ({ ...s, avgScore: Math.round(s.sumPct / s.total) }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // Confidence distribution
    const confidenceDistribution = [
      { label: 'Low (<70%)', count: 0 },
      { label: 'Medium (70-85%)', count: 0 },
      { label: 'High (>85%)', count: 0 },
    ];
    evaluations.forEach((e) => {
      const c = e.trainingData?.avgAiConfidence;
      if (c == null) return;
      if (c < 70) confidenceDistribution[0].count++;
      else if (c < 85) confidenceDistribution[1].count++;
      else confidenceDistribution[2].count++;
    });

    return NextResponse.json({
      totalEvaluations: totalCount,
      avgConfidence,
      avgScore,
      overrideRate,
      passRate,
      finalizedCount,
      subjectStats,
      scoreDistribution,
      monthlyTrend,
      topStudents,
      confidenceDistribution,
    });
  } catch (err: any) {
    console.error('GET /api/analytics error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

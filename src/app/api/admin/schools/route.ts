import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();

    // Derive school stats from evaluations
    const evals = await db.collection('evaluations')
      .find({}, { projection: { 'studentInfo.school': 1, 'studentInfo.rollNo': 1, 'trainingData': 1, status: 1 } })
      .toArray();

    const schoolMap: Record<string, { students: Set<string>; evalCount: number; sumPct: number; scored: number; finalized: number }> = {};
    evals.forEach((e) => {
      const school = e.studentInfo?.school || 'Unknown';
      if (!schoolMap[school]) schoolMap[school] = { students: new Set(), evalCount: 0, sumPct: 0, scored: 0, finalized: 0 };
      schoolMap[school].evalCount++;
      if (e.studentInfo?.rollNo) schoolMap[school].students.add(e.studentInfo.rollNo);
      if (e.trainingData?.totalMax > 0 && e.trainingData?.totalObtained != null) {
        schoolMap[school].sumPct += (e.trainingData.totalObtained / e.trainingData.totalMax) * 100;
        schoolMap[school].scored++;
      }
      if (e.status === 'finalized') schoolMap[school].finalized++;
    });

    // Also fetch manually added schools
    const manualSchools = await db.collection('schools').find({}).toArray();
    manualSchools.forEach((s) => {
      if (!schoolMap[s.name]) schoolMap[s.name] = { students: new Set(), evalCount: 0, sumPct: 0, scored: 0, finalized: 0 };
    });

    const schools = Object.entries(schoolMap).map(([name, d]) => ({
      name,
      studentCount: d.students.size,
      evalCount: d.evalCount,
      avgScore: d.scored > 0 ? Math.round(d.sumPct / d.scored) : null,
      finalized: d.finalized,
    })).sort((a, b) => b.evalCount - a.evalCount);

    return NextResponse.json({ schools });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, address, contactEmail, phone, principalName } = await req.json();
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    const db = await getDb();
    const existing = await db.collection('schools').findOne({ name });
    if (existing) return NextResponse.json({ error: 'School already exists' }, { status: 409 });
    const result = await db.collection('schools').insertOne({ name, address: address ?? '', contactEmail: contactEmail ?? '', phone: phone ?? '', principalName: principalName ?? '', createdAt: new Date() });
    return NextResponse.json({ id: result.insertedId.toString(), name }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

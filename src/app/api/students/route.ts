import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const classFilter = searchParams.get('class') || '';

    const db = await getDb();

    const matchStage: any = {};
    if (search) {
      matchStage.$or = [
        { 'studentInfo.name': { $regex: search, $options: 'i' } },
        { 'studentInfo.rollNo': { $regex: search, $options: 'i' } },
      ];
    }
    if (classFilter) matchStage['studentInfo.class'] = classFilter;

    const pipeline: any[] = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: { name: '$studentInfo.name', rollNo: '$studentInfo.rollNo' },
          class: { $first: '$studentInfo.class' },
          evalCount: { $sum: 1 },
          sumObtained: { $sum: '$trainingData.totalObtained' },
          sumMax: { $sum: '$trainingData.totalMax' },
          sumConfidence: { $sum: '$trainingData.avgAiConfidence' },
          confCount: {
            $sum: { $cond: [{ $ne: ['$trainingData.avgAiConfidence', null] }, 1, 0] },
          },
          lastEvaluated: { $max: '$createdAt' },
          finalizedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'finalized'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          rollNo: '$_id.rollNo',
          class: 1,
          evalCount: 1,
          totalObtained: '$sumObtained',
          totalMax: '$sumMax',
          avgScore: {
            $cond: [
              { $gt: ['$sumMax', 0] },
              { $round: [{ $multiply: [{ $divide: ['$sumObtained', '$sumMax'] }, 100] }, 1] },
              null,
            ],
          },
          avgConfidence: {
            $cond: [
              { $gt: ['$confCount', 0] },
              { $round: [{ $divide: ['$sumConfidence', '$confCount'] }, 0] },
              null,
            ],
          },
          lastEvaluated: 1,
          finalizedCount: 1,
        },
      },
      { $sort: { lastEvaluated: -1 } },
    ];

    const students = await db.collection('evaluations').aggregate(pipeline).toArray();

    return NextResponse.json({ students, total: students.length });
  } catch (err: any) {
    console.error('GET /api/students error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rollNo, class: cls, subject, email, phone, parentName } = body;
    if (!name || !rollNo) {
      return NextResponse.json({ error: 'name and rollNo are required' }, { status: 400 });
    }
    const db = await getDb();
    const now = new Date();
    const result = await db.collection('students').insertOne({
      name,
      rollNo,
      class: cls || '',
      subject: subject || '',
      email: email || '',
      phone: phone || '',
      parentName: parentName || '',
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/students error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

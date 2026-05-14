import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, rollNo, studentClass, school } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'name, email, password and role are required' }, { status: 400 });
    }

    const db = await getDb();

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const doc = {
      name,
      email,
      password, // TODO: hash with bcrypt in production
      role,
      rollNo: rollNo ?? null,
      studentClass: studentClass ?? null,
      school: school ?? null,
      provider: 'credentials',
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(doc);

    return NextResponse.json(
      { id: result.insertedId.toString(), name, email, role },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/users/register error:', err);
    return NextResponse.json({ error: err.message ?? 'Registration failed' }, { status: 500 });
  }
}

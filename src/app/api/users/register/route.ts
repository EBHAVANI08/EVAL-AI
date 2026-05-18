import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'teacher' | 'student' | null = all

    const db = await getDb();
    const query: Record<string, any> = {};
    if (role) query.role = role;

    const users = await db.collection('users')
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        rollNo: u.rollNo ?? null,
        studentClass: u.studentClass ?? null,
        school: u.school ?? null,
        createdAt: u.createdAt?.toISOString?.() ?? String(u.createdAt),
      })),
    });
  } catch (err: any) {
    console.error('GET /api/users/register error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
      password,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/users/register error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

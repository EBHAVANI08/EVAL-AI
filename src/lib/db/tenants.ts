/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — Tenants & Schools
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

/* ─── Tenant ──────────────────────────────────────────────────────────────── */
export interface TenantDoc {
  _id?: ObjectId;
  tenantId: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'enterprise';
  maxSchools: number;
  maxStudents: number;
  boardsAllowed: string[];
  status: 'active' | 'suspended' | 'trial';
  settings: {
    defaultBoardCode: string;
    defaultAcademicYear: string;
    enableValidationAgent: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolDoc {
  _id?: ObjectId;
  schoolId: string;
  tenantId: string;
  name: string;
  address?: string;
  boardCode: string;
  affiliationNo?: string;
  principalName?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  currentAcademicYear: string;
  grades: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

async function col(name: string) {
  const db: Db = await getDb();
  return db.collection(name);
}

/* ── Tenant CRUD ──────────────────────────────────────────────────────────── */
export async function getTenant(tenantId: string): Promise<TenantDoc | null> {
  const c = await col('tenants');
  return c.findOne({ tenantId }) as Promise<TenantDoc | null>;
}

export async function getAllTenants(): Promise<TenantDoc[]> {
  const c = await col('tenants');
  return c.find({}).sort({ createdAt: -1 }).toArray() as Promise<TenantDoc[]>;
}

export async function createTenant(data: Omit<TenantDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const c = await col('tenants');
  const now = new Date();
  const result = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}

export async function upsertDefaultTenant(): Promise<void> {
  const c = await col('tenants');
  const now = new Date();
  await c.updateOne(
    { tenantId: 'TENANT_DEFAULT' },
    {
      $setOnInsert: {
        tenantId: 'TENANT_DEFAULT',
        name: 'Default Organisation',
        slug: 'default',
        plan: 'enterprise',
        maxSchools: 100,
        maxStudents: 50000,
        boardsAllowed: ['CBSE', 'ICSE', 'CAIE', 'IB'],
        status: 'active',
        settings: {
          defaultBoardCode: 'CBSE',
          defaultAcademicYear: '2025-26',
          enableValidationAgent: true,
        },
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}

/* ── School CRUD ──────────────────────────────────────────────────────────── */
export async function getSchool(schoolId: string): Promise<SchoolDoc | null> {
  const c = await col('schools');
  return c.findOne({ schoolId }) as Promise<SchoolDoc | null>;
}

export async function getSchoolsByTenant(tenantId: string): Promise<SchoolDoc[]> {
  const c = await col('schools');
  return c.find({ tenantId }).sort({ createdAt: -1 }).toArray() as Promise<SchoolDoc[]>;
}

export async function createSchool(data: Omit<SchoolDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const c = await col('schools');
  const now = new Date();
  const result = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}

export async function upsertDefaultSchool(): Promise<void> {
  const c = await col('schools');
  const now = new Date();
  await c.updateOne(
    { schoolId: 'SCH_DEFAULT' },
    {
      $setOnInsert: {
        schoolId: 'SCH_DEFAULT',
        tenantId: 'TENANT_DEFAULT',
        name: 'Default School',
        boardCode: 'CBSE',
        currentAcademicYear: '2025-26',
        grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}

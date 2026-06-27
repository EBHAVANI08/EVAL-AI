/* ─────────────────────────────────────────────────────────────────────────────
   Tenant Context Utilities
   Every request must call getTenantContext() to get tenantId + schoolId.
   Falls back to defaults so existing functionality never breaks.
───────────────────────────────────────────────────────────────────────────── */
import { auth } from '@/auth';

export interface TenantContext {
  tenantId: string;
  schoolId: string;
  userEmail: string | null;
  role: string | null;
}

/** Default tenant/school for single-school deployments */
export const DEFAULT_TENANT_ID = 'TENANT_DEFAULT';
export const DEFAULT_SCHOOL_ID = 'SCH_DEFAULT';

/**
 * Extract tenant context from the current session.
 * Safe to call in any API route — never throws.
 */
export async function getTenantContext(): Promise<TenantContext> {
  try {
    const session = await auth();
    const user = session?.user as any;
    return {
      tenantId:  user?.tenantId  ?? DEFAULT_TENANT_ID,
      schoolId:  user?.schoolId  ?? DEFAULT_SCHOOL_ID,
      userEmail: user?.email     ?? null,
      role:      user?.role      ?? null,
    };
  } catch {
    return {
      tenantId:  DEFAULT_TENANT_ID,
      schoolId:  DEFAULT_SCHOOL_ID,
      userEmail: null,
      role:      null,
    };
  }
}

/**
 * Build a MongoDB tenant scope filter for all queries.
 * Usage: db.collection('questions').find({ ...tenantScope(ctx), ...otherFilters })
 */
export function tenantScope(ctx: TenantContext): { tenantId: string; schoolId: string } {
  return { tenantId: ctx.tenantId, schoolId: ctx.schoolId };
}

/**
 * Generate a unique tenant-scoped ID with prefix.
 * e.g. generateId('ASS') → "ASS_1718197200000_a3f2"
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

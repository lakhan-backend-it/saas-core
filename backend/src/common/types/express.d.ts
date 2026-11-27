import type { MembershipRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  /** Active workspace membership (null for platform-only Super Admin calls) */
  tenantId: string | null;
  membershipRole: MembershipRole | null;
};

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
  customDomain: string | null;
  planId: string | null;
  features: string[];
  /** featureKey → limit (null = unlimited) */
  limits: Record<string, number | null>;
};

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: AuthUser;
      tenant?: TenantContext;
    }
  }
}

export {};

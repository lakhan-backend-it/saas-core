export type MembershipRole = 'TENANT_ADMIN' | 'TENANT_USER';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
};

export type Membership = {
  tenantId: string;
  role: MembershipRole;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
};

export type AuthSession = {
  user: AuthUser;
  activeTenantId: string | null;
  membershipRole: MembershipRole | null;
  memberships: Membership[];
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
};

export type MeResponse = {
  user: AuthUser;
  activeTenantId: string | null;
  membershipRole: MembershipRole | null;
  memberships: Membership[];
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
};

export type ApiErrorBody = {
  success: false;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

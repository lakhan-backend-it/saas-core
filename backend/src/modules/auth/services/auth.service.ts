import { MembershipRole, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { hashPassword, verifyPassword } from '../../../common/helpers/password.helper';
import { slugify } from '../../../common/helpers/slug.helper';
import type { LoginBody, RegisterBody } from '../schemas/auth.schema';
import {
  issueTokenPair,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../helpers/token.helper';

type SessionMembership = {
  tenantId: string;
  role: MembershipRole;
  tenant: { id: string; name: string; slug: string };
};

const membershipSelect = {
  tenantId: true,
  role: true,
  isDefault: true,
  tenant: { select: { id: true, name: true, slug: true, isActive: true, deletedAt: true } },
} satisfies Prisma.TenantMembershipSelect;

function mapMemberships(
  rows: Array<{
    tenantId: string;
    role: MembershipRole;
    tenant: { id: string; name: string; slug: string; isActive: boolean; deletedAt: Date | null };
  }>
): SessionMembership[] {
  return rows
    .filter((m) => m.tenant.isActive && !m.tenant.deletedAt)
    .map((m) => ({
      tenantId: m.tenantId,
      role: m.role,
      tenant: { id: m.tenant.id, name: m.tenant.name, slug: m.tenant.slug },
    }));
}

async function uniqueTenantSlug(baseName: string): Promise<string> {
  const base = slugify(baseName) || 'workspace';
  let candidate = base;
  let i = 0;
  while (await prisma.tenant.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

function publicUser(user: {
  id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isSuperAdmin: user.isSuperAdmin,
  };
}

/**
 * Register: creates user + new tenant workspace + TENANT_ADMIN membership.
 * Subscription/plan attach happens in subscriptions module (Super Admin or billing).
 */
export async function register(input: RegisterBody) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    throw AppError.conflict('Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const slug = await uniqueTenantSlug(input.tenantName);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        isSuperAdmin: false,
      },
      select: { id: true, email: true, fullName: true, isSuperAdmin: true },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: input.tenantName,
        slug,
      },
      select: { id: true, name: true, slug: true },
    });

    await tx.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: MembershipRole.TENANT_ADMIN,
        isDefault: true,
      },
    });

    return { user, tenant };
  });

  const tokens = await issueTokenPair({
    user: result.user,
    tenantId: result.tenant.id,
    membershipRole: MembershipRole.TENANT_ADMIN,
  });

  return {
    user: publicUser(result.user),
    tenant: result.tenant,
    memberships: [
      {
        tenantId: result.tenant.id,
        role: MembershipRole.TENANT_ADMIN,
        tenant: result.tenant,
      },
    ] satisfies SessionMembership[],
    ...tokens,
  };
}

export async function login(input: LoginBody) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      fullName: true,
      isSuperAdmin: true,
      isActive: true,
      deletedAt: true,
      passwordHash: true,
      memberships: {
        where: { isActive: true },
        select: membershipSelect,
      },
    },
  });

  // Constant-ish failure message (no user enumeration)
  const invalid = () => AppError.unauthorized('Invalid email or password');

  if (!user || !user.isActive || user.deletedAt) {
    throw invalid();
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw invalid();

  const memberships = mapMemberships(user.memberships);

  let tenantId: string | null = null;
  let membershipRole: MembershipRole | null = null;

  if (user.isSuperAdmin && memberships.length === 0 && !input.tenantId) {
    tenantId = null;
    membershipRole = null;
  } else if (input.tenantId) {
    const chosen = memberships.find((m) => m.tenantId === input.tenantId);
    if (!chosen) {
      if (user.isSuperAdmin) {
        const tenant = await prisma.tenant.findFirst({
          where: { id: input.tenantId, deletedAt: null, isActive: true },
          select: { id: true },
        });
        if (!tenant) throw AppError.forbidden('Not a member of this tenant');
        tenantId = tenant.id;
        membershipRole = null;
      } else {
        throw AppError.forbidden('Not a member of this tenant');
      }
    } else {
      tenantId = chosen.tenantId;
      membershipRole = chosen.role;
    }
  } else {
    const defaultMembership =
      user.memberships.find((m) => m.isDefault && m.tenant.isActive && !m.tenant.deletedAt) ??
      user.memberships.find((m) => m.tenant.isActive && !m.tenant.deletedAt);

    if (!defaultMembership && !user.isSuperAdmin) {
      throw AppError.forbidden('No active workspace membership');
    }

    if (defaultMembership) {
      tenantId = defaultMembership.tenantId;
      membershipRole = defaultMembership.role;
    }
  }

  const tokens = await issueTokenPair({
    user,
    tenantId,
    membershipRole,
  });

  return {
    user: publicUser(user),
    activeTenantId: tenantId,
    membershipRole,
    memberships,
    ...tokens,
  };
}

export async function refresh(rawRefreshToken: string) {
  const rotated = await rotateRefreshToken(rawRefreshToken);
  if (!rotated) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const { user } = rotated;
  const memberships = mapMemberships(
    await prisma.tenantMembership.findMany({
      where: { userId: user.id, isActive: true },
      select: membershipSelect,
    })
  );

  let tenantId = rotated.tenantId;
  let membershipRole = rotated.membershipRole;

  // Re-validate workspace still allowed
  if (tenantId) {
    const stillMember = memberships.find((m) => m.tenantId === tenantId);
    if (stillMember) {
      membershipRole = stillMember.role;
    } else if (!user.isSuperAdmin) {
      const fallback = memberships[0] ?? null;
      tenantId = fallback?.tenantId ?? null;
      membershipRole = fallback?.role ?? null;
    } else {
      membershipRole = null;
    }
  }

  const tokens = await issueTokenPair({
    user,
    tenantId,
    membershipRole,
  });

  return {
    user: publicUser(user),
    activeTenantId: tenantId,
    membershipRole,
    memberships,
    ...tokens,
  };
}

export async function logout(rawRefreshToken: string) {
  await revokeRefreshToken(rawRefreshToken);
  return { success: true as const };
}

export async function me(userId: string, activeTenantId: string | null) {
  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
    select: {
      id: true,
      email: true,
      fullName: true,
      isSuperAdmin: true,
      memberships: {
        where: { isActive: true },
        select: membershipSelect,
      },
    },
  });

  if (!user) throw AppError.unauthorized();

  const memberships = mapMemberships(user.memberships);
  const active = activeTenantId
    ? memberships.find((m) => m.tenantId === activeTenantId) ?? null
    : null;

  return {
    user: publicUser(user),
    activeTenantId,
    membershipRole: active?.role ?? null,
    memberships,
  };
}

export async function switchTenant(userId: string, tenantId: string, isSuperAdmin: boolean) {
  const membership = await prisma.tenantMembership.findFirst({
    where: {
      userId,
      tenantId,
      isActive: true,
      tenant: { isActive: true, deletedAt: null },
    },
    select: membershipSelect,
  });

  if (!membership) {
    if (!isSuperAdmin) throw AppError.forbidden('Not a member of this tenant');

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, isActive: true, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });
    if (!tenant) throw AppError.notFound('Tenant');

    const user = await prisma.user.findFirstOrThrow({
      where: { id: userId, isActive: true, deletedAt: null },
      select: { id: true, email: true, fullName: true, isSuperAdmin: true },
    });

    const tokens = await issueTokenPair({
      user,
      tenantId: tenant.id,
      membershipRole: null,
    });

    const memberships = mapMemberships(
      await prisma.tenantMembership.findMany({
        where: { userId, isActive: true },
        select: membershipSelect,
      })
    );

    return {
      user: publicUser(user),
      activeTenantId: tenant.id,
      membershipRole: null,
      memberships,
      ...tokens,
    };
  }

  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId, isActive: true, deletedAt: null },
    select: { id: true, email: true, fullName: true, isSuperAdmin: true },
  });

  await prisma.tenantMembership.updateMany({
    where: { userId },
    data: { isDefault: false },
  });
  await prisma.tenantMembership.update({
    where: { userId_tenantId: { userId, tenantId } },
    data: { isDefault: true },
  });

  const memberships = mapMemberships(
    await prisma.tenantMembership.findMany({
      where: { userId, isActive: true },
      select: membershipSelect,
    })
  );

  const tokens = await issueTokenPair({
    user,
    tenantId: membership.tenantId,
    membershipRole: membership.role,
  });

  return {
    user: publicUser(user),
    activeTenantId: membership.tenantId,
    membershipRole: membership.role,
    memberships,
    ...tokens,
  };
}

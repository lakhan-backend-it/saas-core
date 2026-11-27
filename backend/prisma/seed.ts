import { PrismaClient, MembershipRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SuperAdmin1!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@saas.local' },
    update: {
      passwordHash,
      fullName: 'Super Admin',
      isSuperAdmin: true,
      isActive: true,
      deletedAt: null,
    },
    create: {
      email: 'superadmin@saas.local',
      passwordHash,
      fullName: 'Super Admin',
      isSuperAdmin: true,
    },
  });

  const features = [
    { key: 'projects', name: 'Projects', description: 'Create and manage projects' },
    { key: 'tasks', name: 'Tasks', description: 'Task management inside projects' },
    { key: 'advanced_reports', name: 'Advanced Reports', description: 'Reporting module' },
    { key: 'file_uploads', name: 'File Uploads', description: 'Tenant file storage' },
  ];

  for (const f of features) {
    await prisma.feature.upsert({
      where: { key: f.key },
      update: { name: f.name, description: f.description },
      create: f,
    });
  }

  const free = await prisma.plan.upsert({
    where: { code: 'free' },
    update: { name: 'Free', description: 'Starter plan', isActive: true },
    create: {
      name: 'Free',
      code: 'free',
      description: 'Starter plan',
    },
  });

  const pro = await prisma.plan.upsert({
    where: { code: 'pro' },
    update: { name: 'Pro', description: 'Full features', isActive: true },
    create: {
      name: 'Pro',
      code: 'pro',
      description: 'Full features',
    },
  });

  const allFeatures = await prisma.feature.findMany();
  const byKey = Object.fromEntries(allFeatures.map((f) => [f.key, f.id]));

  const freeMap: Array<{ key: string; enabled: boolean; limit: number | null }> = [
    { key: 'projects', enabled: true, limit: 5 },
    { key: 'tasks', enabled: false, limit: null },
    { key: 'advanced_reports', enabled: false, limit: null },
    { key: 'file_uploads', enabled: false, limit: null },
  ];

  const proMap: Array<{ key: string; enabled: boolean; limit: number | null }> = [
    { key: 'projects', enabled: true, limit: null },
    { key: 'tasks', enabled: true, limit: null },
    { key: 'advanced_reports', enabled: true, limit: null },
    { key: 'file_uploads', enabled: true, limit: 100 },
  ];

  for (const row of freeMap) {
    await prisma.planFeature.upsert({
      where: { planId_featureId: { planId: free.id, featureId: byKey[row.key] } },
      update: { enabled: row.enabled, limit: row.limit },
      create: {
        planId: free.id,
        featureId: byKey[row.key],
        enabled: row.enabled,
        limit: row.limit,
      },
    });
  }

  for (const row of proMap) {
    await prisma.planFeature.upsert({
      where: { planId_featureId: { planId: pro.id, featureId: byKey[row.key] } },
      update: { enabled: row.enabled, limit: row.limit },
      create: {
        planId: pro.id,
        featureId: byKey[row.key],
        enabled: row.enabled,
        limit: row.limit,
      },
    });
  }

  // Demo tenants on different plans (for later modules / credentials)
  const demoPassword = await bcrypt.hash('TenantAdmin1!', 12);

  async function ensureTenant(opts: {
    name: string;
    slug: string;
    planId: string;
    adminEmail: string;
  }) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: opts.slug },
      update: { name: opts.name, isActive: true, deletedAt: null },
      create: { name: opts.name, slug: opts.slug },
    });

    await prisma.subscription.upsert({
      where: { tenantId: tenant.id },
      update: { planId: opts.planId, status: 'ACTIVE' },
      create: { tenantId: tenant.id, planId: opts.planId, status: 'ACTIVE' },
    });

    const admin = await prisma.user.upsert({
      where: { email: opts.adminEmail },
      update: {
        passwordHash: demoPassword,
        fullName: `${opts.name} Admin`,
        isActive: true,
        deletedAt: null,
      },
      create: {
        email: opts.adminEmail,
        passwordHash: demoPassword,
        fullName: `${opts.name} Admin`,
      },
    });

    await prisma.tenantMembership.upsert({
      where: { userId_tenantId: { userId: admin.id, tenantId: tenant.id } },
      update: { role: MembershipRole.TENANT_ADMIN, isActive: true, isDefault: true },
      create: {
        userId: admin.id,
        tenantId: tenant.id,
        role: MembershipRole.TENANT_ADMIN,
        isDefault: true,
      },
    });

    return { tenant, admin };
  }

  await ensureTenant({
    name: 'Acme Free',
    slug: 'acme-free',
    planId: free.id,
    adminEmail: 'admin@acme-free.local',
  });

  await ensureTenant({
    name: 'Globex Pro',
    slug: 'globex-pro',
    planId: pro.id,
    adminEmail: 'admin@globex-pro.local',
  });

  console.log('Seed complete');
  console.log({
    superAdmin: { email: superAdmin.email, password: 'SuperAdmin1!' },
    tenants: [
      { email: 'admin@acme-free.local', password: 'TenantAdmin1!', plan: 'free' },
      { email: 'admin@globex-pro.local', password: 'TenantAdmin1!', plan: 'pro' },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

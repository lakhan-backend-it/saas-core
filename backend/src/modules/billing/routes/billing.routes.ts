import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate';
import { requireRoles } from '../../../common/middleware/require-roles';
import { resolveTenant, requireTenant } from '../../../common/middleware/resolve-tenant';
import { asyncHandler } from '../../../common/middleware/async-handler';
import { sendCreated, sendSuccess } from '../../../common/http/api-response';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../common/errors/app-error';
import { writeAudit } from '../../../common/helpers/audit.helper';
import { z } from 'zod';

export const billingRouter = Router();

billingRouter.get(
  '/invoices',
  authenticate,
  resolveTenant,
  requireTenant,
  asyncHandler(async (req, res) => {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId: req.tenant!.id },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, invoices);
  })
);

const checkoutSchema = z.object({
  planId: z.string().cuid(),
  amountCents: z.number().int().positive().default(3000),
});

/**
 * Simulated Stripe checkout when STRIPE keys are absent.
 * Creates/updates subscription + invoice in PAID state for demo.
 */
billingRouter.post(
  '/checkout',
  authenticate,
  resolveTenant,
  requireTenant,
  requireRoles({ roles: ['TENANT_ADMIN'], superAdmin: true }),
  asyncHandler(async (req, res) => {
    const body = checkoutSchema.parse(req.body);
    const plan = await prisma.plan.findFirst({
      where: { id: body.planId, deletedAt: null, isActive: true },
    });
    if (!plan) throw AppError.notFound('Plan');

    const tenantId = req.tenant!.id;
    const subscription = await prisma.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId: plan.id,
        status: 'ACTIVE',
        stripeCustomerId: `cus_sim_${tenantId.slice(-8)}`,
        stripeSubscriptionId: `sub_sim_${Date.now()}`,
      },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        stripeSubscriptionId: `sub_sim_${Date.now()}`,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        stripeInvoiceId: `in_sim_${Date.now()}`,
        amountCents: body.amountCents,
        currency: 'usd',
        status: 'PAID',
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        tenantId,
        title: 'Subscription updated',
        body: `Plan switched to ${plan.name}. Invoice ${invoice.id} marked paid (simulated).`,
      },
    });

    await writeAudit(req, {
      action: 'billing.checkout',
      resource: 'Invoice',
      resourceId: invoice.id,
      tenantId,
      metadata: { planId: plan.id, mode: 'simulated' },
    });

    sendCreated(res, { subscription, invoice, mode: 'simulated' });
  })
);

billingRouter.get(
  '/admin/invoices',
  authenticate,
  requireRoles({ superAdmin: true }),
  asyncHandler(async (_req, res) => {
    const invoices = await prisma.invoice.findMany({
      include: { tenant: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    sendSuccess(res, invoices);
  })
);

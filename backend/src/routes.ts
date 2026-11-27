import type { Express } from 'express';
import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/routes/auth.routes';
import { tenantsRouter } from './modules/tenants/routes/tenants.routes';
import { membershipsRouter } from './modules/memberships/routes/memberships.routes';
import { usersRouter } from './modules/users/routes/users.routes';
import { invitationsRouter } from './modules/invitations/routes/invitations.routes';
import { plansRouter } from './modules/plans/routes/plans.routes';
import { featuresRouter } from './modules/features/routes/features.routes';
import { subscriptionsRouter } from './modules/subscriptions/routes/subscriptions.routes';
import { usageRouter } from './modules/usage/routes/usage.routes';
import { billingRouter } from './modules/billing/routes/billing.routes';
import { auditLogsRouter } from './modules/audit-logs/routes/audit-logs.routes';
import { notificationsRouter } from './modules/notifications/routes/notifications.routes';
import { filesRouter } from './modules/files/routes/files.routes';
import { projectsRouter } from './modules/projects/routes/projects.routes';
import { tasksRouter } from './modules/tasks/routes/tasks.routes';
import { setupSwagger } from './docs/swagger';

/**
 * Single registration point for all HTTP routes.
 * Versioned under /api/v1 for safe future evolution.
 */
export function registerRoutes(app: Express) {
  const v1 = Router();

  v1.use('/health', healthRouter);
  v1.use('/auth', authRouter);
  v1.use('/tenants', tenantsRouter);
  v1.use('/memberships', membershipsRouter);
  v1.use('/users', usersRouter);
  v1.use('/invitations', invitationsRouter);
  v1.use('/plans', plansRouter);
  v1.use('/features', featuresRouter);
  v1.use('/subscriptions', subscriptionsRouter);
  v1.use('/usage', usageRouter);
  v1.use('/billing', billingRouter);
  v1.use('/audit-logs', auditLogsRouter);
  v1.use('/notifications', notificationsRouter);
  v1.use('/files', filesRouter);
  v1.use('/projects', projectsRouter);
  v1.use('/tasks', tasksRouter);

  app.use('/api/v1', v1);
  setupSwagger(app);
}

import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const bearer = [{ bearerAuth: [] }];

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Multi-Tenant SaaS Core API',
    version: '1.0.0',
    description:
      'Softlligence practical task API — tenant isolation, plans/feature gating, JWT RBAC, usage limits.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      tenantHeader: { type: 'apiKey', in: 'header', name: 'X-Tenant-ID' },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          code: { type: 'string' },
          message: { type: 'string' },
          requestId: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe (DB)',
        responses: { '200': { description: 'Ready' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user + tenant workspace',
        responses: { '201': { description: 'Created' }, '409': { description: 'Conflict' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        responses: { '200': { description: 'Tokens issued' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token',
        responses: { '200': { description: 'New token pair' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke refresh token',
        responses: { '200': { description: 'Revoked' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        security: bearer,
        summary: 'Current user + memberships',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/switch-tenant': {
      post: {
        tags: ['Auth'],
        security: bearer,
        summary: 'Switch active workspace',
        responses: { '200': { description: 'New token pair' } },
      },
    },
    '/plans': {
      get: {
        tags: ['Plans'],
        security: bearer,
        summary: 'List plans (Super Admin)',
        responses: { '200': { description: 'OK' }, '403': { description: 'Forbidden' } },
      },
      post: {
        tags: ['Plans'],
        security: bearer,
        summary: 'Create plan',
        responses: { '201': { description: 'Created' } },
      },
    },
    '/plans/catalog': {
      get: {
        tags: ['Plans'],
        security: bearer,
        summary: 'Active plan catalog (any authenticated user)',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/features': {
      get: {
        tags: ['Features'],
        security: bearer,
        summary: 'List feature catalog',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/subscriptions': {
      get: {
        tags: ['Subscriptions'],
        security: bearer,
        summary: 'List subscriptions',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/subscriptions/assign': {
      post: {
        tags: ['Subscriptions'],
        security: bearer,
        summary: 'Assign plan to tenant',
        responses: { '200': { description: 'Assigned' } },
      },
    },
    '/tenants': {
      get: {
        tags: ['Tenants'],
        security: bearer,
        summary: 'List tenants',
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Tenants'],
        security: bearer,
        summary: 'Create tenant',
        responses: { '201': { description: 'Created' } },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        security: bearer,
        summary: 'List users in active tenant',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        security: bearer,
        summary: 'List projects (feature: projects)',
        responses: { '200': { description: 'OK' }, '403': { description: 'Feature disabled / limit' } },
      },
      post: {
        tags: ['Projects'],
        security: bearer,
        summary: 'Create project',
        responses: { '201': { description: 'Created' } },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        security: bearer,
        summary: 'List tasks (feature: tasks)',
        responses: { '200': { description: 'OK' }, '403': { description: 'Feature disabled' } },
      },
      post: {
        tags: ['Tasks'],
        security: bearer,
        summary: 'Create task',
        responses: { '201': { description: 'Created' } },
      },
    },
    '/usage': {
      get: {
        tags: ['Usage'],
        security: bearer,
        summary: 'Tenant usage + plan limits',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/invitations': {
      get: {
        tags: ['Invitations'],
        security: bearer,
        summary: 'List invitations',
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Invitations'],
        security: bearer,
        summary: 'Create invitation',
        responses: { '201': { description: 'Created' } },
      },
    },
    '/invitations/accept': {
      post: {
        tags: ['Invitations'],
        summary: 'Accept invitation',
        responses: { '200': { description: 'Accepted' } },
      },
    },
    '/audit-logs': {
      get: {
        tags: ['Audit'],
        security: bearer,
        summary: 'Recent audit logs',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        security: bearer,
        summary: 'List notifications',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/files': {
      get: {
        tags: ['Files'],
        security: bearer,
        summary: 'List files (feature: file_uploads)',
        responses: { '200': { description: 'OK' }, '403': { description: 'Feature disabled' } },
      },
    },
    '/billing/invoices': {
      get: {
        tags: ['Billing'],
        security: bearer,
        summary: 'Tenant invoices',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/billing/checkout': {
      post: {
        tags: ['Billing'],
        security: bearer,
        summary: 'Simulated checkout / plan change',
        responses: { '201': { description: 'Created' } },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.get('/api/docs.json', (_req, res) => res.json(openApiDocument));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

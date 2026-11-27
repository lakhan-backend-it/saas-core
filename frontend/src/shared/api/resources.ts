import { api } from './client';
import type { ApiSuccess } from '../types/auth';

async function data<T>(p: Promise<{ data: ApiSuccess<T> }>) {
  const res = await p;
  return res.data.data;
}

export const resources = {
  plans: {
    list: () => data(api.get('/plans')),
    catalog: () => data(api.get('/plans/catalog')),
    create: (body: object) => data(api.post('/plans', body)),
    update: (id: string, body: object) => data(api.patch(`/plans/${id}`, body)),
    setFeatures: (id: string, body: object) => data(api.put(`/plans/${id}/features`, body)),
  },
  features: {
    list: () => data(api.get('/features')),
    create: (body: object) => data(api.post('/features', body)),
  },
  tenants: {
    list: () => data(api.get('/tenants')),
    create: (body: object) => data(api.post('/tenants', body)),
    update: (id: string, body: object) => data(api.patch(`/tenants/${id}`, body)),
    get: (id: string) => data(api.get(`/tenants/${id}`)),
  },
  subscriptions: {
    list: () => data(api.get('/subscriptions')),
    assign: (body: object) => data(api.post('/subscriptions/assign', body)),
  },
  projects: {
    list: () => data(api.get('/projects')),
    create: (body: object) => data(api.post('/projects', body)),
    update: (id: string, body: object) => data(api.patch(`/projects/${id}`, body)),
    remove: (id: string) => data(api.delete(`/projects/${id}`)),
  },
  tasks: {
    list: (projectId?: string) =>
      data(api.get('/tasks', { params: projectId ? { projectId } : undefined })),
    create: (body: object) => data(api.post('/tasks', body)),
    update: (id: string, body: object) => data(api.patch(`/tasks/${id}`, body)),
    remove: (id: string) => data(api.delete(`/tasks/${id}`)),
  },
  users: {
    list: () => data(api.get('/users')),
    create: (body: object) => data(api.post('/users', body)),
  },
  invitations: {
    list: () => data(api.get('/invitations')),
    create: (body: object) => data(api.post('/invitations', body)),
    accept: (body: object) => data(api.post('/invitations/accept', body)),
  },
  usage: {
    get: () => data(api.get('/usage')),
  },
  notifications: {
    list: () => data(api.get('/notifications')),
    read: (id: string) => data(api.post(`/notifications/${id}/read`)),
  },
  files: {
    list: () => data(api.get('/files')),
    upload: (body: object) => data(api.post('/files', body)),
    remove: (id: string) => data(api.delete(`/files/${id}`)),
  },
  billing: {
    invoices: () => data(api.get('/billing/invoices')),
    adminInvoices: () => data(api.get('/billing/admin/invoices')),
    checkout: (body: object) => data(api.post('/billing/checkout', body)),
  },
  audit: {
    list: () => data(api.get('/audit-logs')),
  },
};

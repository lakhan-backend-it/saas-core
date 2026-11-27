import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  planId: z.string().cuid().optional(),
  customDomain: z.string().trim().max(255).nullable().optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  customDomain: z.string().trim().max(255).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

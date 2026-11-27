import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  fullName: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
  role: z.enum(['TENANT_ADMIN', 'TENANT_USER']).default('TENANT_USER'),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  role: z.enum(['TENANT_ADMIN', 'TENANT_USER']).optional(),
  isActive: z.boolean().optional(),
});

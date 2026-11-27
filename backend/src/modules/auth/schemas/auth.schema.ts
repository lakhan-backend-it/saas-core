import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email()
  .max(255)
  .transform((v) => v.toLowerCase());

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/[0-9]/, 'Password must include a number');

export const registerBodySchema = z.object({
  email,
  password,
  fullName: z.string().trim().min(2).max(120),
  tenantName: z.string().trim().min(2).max(120),
});

export const loginBodySchema = z.object({
  email,
  password: z.string().min(1).max(128),
  tenantId: z.string().cuid().optional(),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(20).max(512),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(20).max(512),
});

export const switchTenantBodySchema = z.object({
  tenantId: z.string().cuid(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;

import { z } from 'zod';

export const createFeatureSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_]+$/, 'Use lowercase snake_case'),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
});

export const updateFeatureSchema = createFeatureSchema.partial();

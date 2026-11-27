import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_-]+$/, 'Use lowercase letters, numbers, _ or -'),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export const setPlanFeaturesSchema = z.object({
  features: z
    .array(
      z.object({
        featureId: z.string().cuid(),
        enabled: z.boolean(),
        limit: z.number().int().positive().nullable().optional(),
      })
    )
    .min(1),
});

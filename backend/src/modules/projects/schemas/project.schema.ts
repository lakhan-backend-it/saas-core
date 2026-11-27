import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  isActive: z.boolean().optional(),
});

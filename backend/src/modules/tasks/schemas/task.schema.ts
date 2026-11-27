import { z } from 'zod';

export const createTaskSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  isDone: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

import { z } from 'zod';

export const assignSubscriptionSchema = z.object({
  tenantId: z.string().cuid(),
  planId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING']).optional(),
});

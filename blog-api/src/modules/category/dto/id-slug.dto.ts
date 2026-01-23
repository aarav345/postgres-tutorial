import { z } from 'zod';

export const CategoryIdSlugSchema = z.object({
    id: z.coerce.number().int().positive('Category ID must be a positive number').optional(),
    slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .max(50, 'Slug must not exceed 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .optional(),
}).strict();

export type CategoryIdSlugDto = z.infer<typeof CategoryIdSlugSchema>;

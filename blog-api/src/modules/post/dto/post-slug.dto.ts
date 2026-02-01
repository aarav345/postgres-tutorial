import { z } from 'zod';

export const PostSlugSchema = z.object({
    slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(200, 'Slug must not exceed 200 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export type PostSlugDto = z.infer<typeof PostSlugSchema>;
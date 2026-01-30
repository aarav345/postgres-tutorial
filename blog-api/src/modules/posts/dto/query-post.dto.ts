import { z } from 'zod';

export const QueryPostDtoSchema = z.object({
    page: z
        .string()
        .optional()
        .default('1')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1, 'Page must be at least 1')),
    limit: z
        .string()
        .optional()
        .default('10')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100, 'Limit must be between 1 and 100')),
    search: z
        .string()
        .max(100, 'Search query must not exceed 100 characters')
        .trim()
        .optional(),
    categoryId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    authorId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
    published: z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
    featured: z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
});

export type QueryPostDto = z.infer<typeof QueryPostDtoSchema>;
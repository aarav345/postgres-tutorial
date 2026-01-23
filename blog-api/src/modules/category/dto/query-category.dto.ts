import { z } from 'zod';

export const QueryCategorySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .optional()
        .default(10),

    search: z.string().max(100, 'Search query must not exceed 100 characters').trim().min(1).optional(),
    includePosts: z.boolean().optional(),
}).strict();

export type QueryCategoryDto = z.infer<typeof QueryCategorySchema>;
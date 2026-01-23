import { z } from 'zod';

export const CreateCategorySchema = z.object({
    name: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(50, 'Category name must not exceed 50 characters')
        .trim(),
    slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .max(50, 'Slug must not exceed 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .optional(),
    description: z
        .string()
        .max(500, 'Description must not exceed 500 characters')
        .trim()
        .optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
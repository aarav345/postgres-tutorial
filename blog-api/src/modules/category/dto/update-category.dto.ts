import { z } from 'zod';

export const UpdateCategorySchema = z.object({
    name: z
        .string()
        .min(2, 'Category name must be at least 2 characters')
        .max(50, 'Category name must not exceed 50 characters')
        .trim()
        .optional(),
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
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
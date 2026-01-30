import { z } from 'zod';

export const CreatePostDtoSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim(),
    slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(200, 'Slug must not exceed 200 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .optional(),
    content: z
        .string()
        .min(10, 'Content must be at least 10 characters'),
    excerpt: z
        .string()
        .max(500, 'Excerpt must not exceed 500 characters')
        .trim()
        .optional(),
    categoryId: z
        .number()
        .int()
        .positive('Category ID must be a positive number')
        .optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
});

export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;
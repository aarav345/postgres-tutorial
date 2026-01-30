import { z } from 'zod';

export const PostIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'Post ID must be a valid number')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().positive('Post ID must be a positive number')),
});

export type PostIdDto = z.infer<typeof PostIdSchema>;
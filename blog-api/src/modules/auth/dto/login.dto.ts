import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
}).strict();

export type LoginDto = z.infer<typeof LoginSchema>;

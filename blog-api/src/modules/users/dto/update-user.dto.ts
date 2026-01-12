import { Role } from '../../../generated/prisma';
import { z } from 'zod';

export const UpdateUserDtoSchema = z.object({
    email: z.string().refine((value) => {
        // Custom validation logic for email format
        // You can use regular expressions or other validation methods here
        return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value);
    }, {
        message: 'Valid email is required',
    }).optional(),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.enum([Role.ADMIN, Role.USER]).optional(),
}).strict();

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;

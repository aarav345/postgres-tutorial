import { z } from 'zod';
import { Role } from '../../../generated/prisma';

export const QueryUserSchema = z.object({
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

    role: z.enum(Role).optional(),

    search: z.string().trim().min(1).optional(),
}).strict();

export type QueryUserDto = z.infer<typeof QueryUserSchema>;

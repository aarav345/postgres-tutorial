import { z } from 'zod';


export const UserIdSchema = z.object({
    id: z.coerce.number().int().positive('Invalid user ID'),
}).strict();


export type UserIdDto = z.infer<typeof UserIdSchema>;
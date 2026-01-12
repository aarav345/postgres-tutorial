import { z } from 'zod';

export const ChangePasswordDtoSchema = z.object({
    currentPassword: z.string().min(1, 'Current Password is required'),
    newPassword: z.string().min(1, 'New Password is required'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).strict();

export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;

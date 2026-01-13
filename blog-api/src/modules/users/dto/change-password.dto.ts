import { z } from 'zod';

export const ChangePasswordDtoSchema = z.object({
    currentPassword: z.string().min(1, 'Current Password is required'),
    newPassword: z.string().min(8, 'New Password is required'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})
.strict();

export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;

// export interface RegisterDto {
//     email: string;
//     username: string;
//     password: string;
// }


import {z} from  "zod";

export const RegisterSchema = z.object({
    email: z.string().email('Valid Email is Required'),
    username: z 
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format'),
    password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
    ),
}).strict(); // 🔒 removes extra fields

export type RegisterDto = z.infer<typeof RegisterSchema>;
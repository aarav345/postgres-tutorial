import z from "zod";

export const UsernameSchema = z.object({
    username: z.string().min(3).max(50),
}).strict();

export type UsernameDto = z.infer<typeof UsernameSchema>;
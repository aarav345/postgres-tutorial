import z from "zod";

export const familySchema = z.object({
    family: z.string().min(3).max(50),
}).strict();

export type familyDto = z.infer<typeof familySchema>;
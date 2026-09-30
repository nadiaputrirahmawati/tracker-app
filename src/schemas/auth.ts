import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
})

export type SignUpSchema = z.infer<typeof signUpSchema>;
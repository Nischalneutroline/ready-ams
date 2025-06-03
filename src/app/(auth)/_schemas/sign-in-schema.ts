import * as z from "zod";

export const LogInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginType = z.infer<typeof LogInSchema>;

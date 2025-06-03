import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

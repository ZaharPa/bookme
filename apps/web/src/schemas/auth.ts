import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registrationSchema = z
  .object({
    email: z.email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    name: z.string().min(1, "Name is required").max(100),
    confirmPassword: z.string().min(1, "Password is required"),
  })
  .refine((u) => u.password === u.confirmPassword, {
    error: "Passwords should be the same",
    path: ["confirmPassword"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegistrationForm = z.infer<typeof registrationSchema>;

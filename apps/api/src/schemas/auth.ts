import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1, "Password is required"),
});

export const RegistrationSchema = z.object({
  email: z.email().min(1),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  name: z.string().min(1).max(100),
});

export type Login = z.infer<typeof LoginSchema>;
export type Registartion = z.infer<typeof RegistrationSchema>;

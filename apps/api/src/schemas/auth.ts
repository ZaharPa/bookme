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

export const VerifyEmailSchema = z.object({
  token: z.string().length(64),
});

export const ForgetPasswordSchema = z.object({
  email: z.email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().length(64),
  newPassword: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export type Login = z.infer<typeof LoginSchema>;
export type Registartion = z.infer<typeof RegistrationSchema>;
export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;
export type ForgetPassword = z.infer<typeof ForgetPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;

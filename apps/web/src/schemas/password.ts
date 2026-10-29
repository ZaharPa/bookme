import { z } from "zod";

const newPassword = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

export const ForgetPasswordSchema = z.object({
  email: z.email(),
});

export const ResetPasswordSchema = z.object({
  newPassword,
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password is required"),
  newPassword,
});

export type ForgetPassword = z.infer<typeof ForgetPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

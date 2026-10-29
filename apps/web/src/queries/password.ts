import { api } from "../lib/api";
import type { ChangePassword } from "../schemas/password";

export function forgetPassword(email: string) {
  return api.post("/auth/forget-password", { email });
}

export function resetPassword(token: string, newPassword: string) {
  return api.post("/auth/reset-password", { token, newPassword });
}

export function changePassword(input: ChangePassword) {
  return api.patch("/users/password", input);
}

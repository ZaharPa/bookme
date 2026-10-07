import express from "express";
import { validate } from "../middlewares/validate";
import {
  ForgetPasswordSchema,
  LoginSchema,
  RegistrationSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from "../schemas/auth";
import {
  forgetPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  sendVerification,
  verifyEmail,
} from "../controllers/auth";
import { authLimiter } from "../middlewares/rateLimit";
import { requireAuth } from "../middlewares/authHandler";

const router: express.Router = express.Router();

router.post("/login", authLimiter, validate(LoginSchema), login);
router.post(
  "/registarion",
  authLimiter,
  validate(RegistrationSchema),
  register,
);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/send-verification", authLimiter, requireAuth, sendVerification);
router.post(
  "/verify-email",
  authLimiter,
  validate(VerifyEmailSchema),
  verifyEmail,
);
router.post(
  "/forget-password",
  authLimiter,
  validate(ForgetPasswordSchema),
  forgetPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(ResetPasswordSchema),
  resetPassword,
);

export default router;

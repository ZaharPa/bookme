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
import { requireAuth } from "../middlewares/authHandler";
import {
  emailLimiter,
  loginLimiter,
  passwordLimiter,
  refreshLimiter,
  registerLimiter,
} from "../middlewares/rateLimit";

const router: express.Router = express.Router();

router.post("/login", loginLimiter, validate(LoginSchema), login);
router.post(
  "/registration",
  registerLimiter,
  validate(RegistrationSchema),
  register,
);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", logout);
router.post("/send-verification", emailLimiter, requireAuth, sendVerification);
router.post(
  "/verify-email",
  emailLimiter,
  validate(VerifyEmailSchema),
  verifyEmail,
);
router.post(
  "/forget-password",
  passwordLimiter,
  validate(ForgetPasswordSchema),
  forgetPassword,
);
router.post(
  "/reset-password",
  passwordLimiter,
  validate(ResetPasswordSchema),
  resetPassword,
);

export default router;

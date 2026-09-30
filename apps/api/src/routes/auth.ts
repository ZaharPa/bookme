import express from "express";
import { validate } from "../middlewares/validate";
import { LoginSchema, RegistrationSchema } from "../schemas/auth";
import { login, logout, refresh, register } from "../controllers/auth";
import { authLimiter } from "../middlewares/rateLimit";

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

export default router;

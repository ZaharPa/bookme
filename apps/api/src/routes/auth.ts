import express from "express";
import { validate } from "../middlewares/validate";
import { LoginSchema, RegistrationSchema } from "../schemas/auth";
import { login, register } from "../controllers/auth";

const router = express.Router();

router.post("/login", validate(LoginSchema), login);
router.post("/registarion", validate(RegistrationSchema), register);

export default router;

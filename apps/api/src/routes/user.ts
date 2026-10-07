import express from "express";
import { changePassword, me } from "../controllers/user";
import { validate } from "../middlewares/validate";
import { userPasswordSchema } from "../schemas/user";

const router: express.Router = express.Router();

router.get("/", me);
router.patch("/password", validate(userPasswordSchema), changePassword);

export default router;

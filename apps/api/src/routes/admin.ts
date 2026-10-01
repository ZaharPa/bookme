import express from "express";
import {
  allBusinesses,
  allUsers,
  banUser,
  changeBusinessStatus,
  stats,
  unBanUser,
} from "../controllers/admin";
import { validate } from "../middlewares/validate";
import { BusinessStatusSchema } from "../schemas/admin";

const router: express.Router = express.Router();

router.get("/users", allUsers);
router.get("/businesses", allBusinesses);
router.get("/stats", stats);
router.patch("/users/:userId/ban", banUser);
router.patch("/users/:userId/unban", unBanUser);
router.patch(
  "/businesses/:businessId/status",
  validate(BusinessStatusSchema),
  changeBusinessStatus,
);

export default router;

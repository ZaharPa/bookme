import express from "express";
import { requireAuth, requireRole } from "../middlewares/authHandler";
import { validate } from "../middlewares/validate";
import {
  BusinessSchema,
  LocationSchema,
  ResourceSchema,
} from "../schemas/business";
import { businessOwner, locationCheck } from "../middlewares/businessHandler";

const router: express.Router = express.Router();

router.post("/", requireAuth, validate(BusinessSchema));
router.post(
  "/:businessId/locations",
  requireAuth,
  businessOwner,
  validate(LocationSchema),
);
router.post(
  "/:businessId/:locationId/resources",
  requireAuth,
  locationCheck,
  validate(ResourceSchema),
);

export default router;

import express from "express";
import { requireAuth, requireRole } from "../middlewares/authHandler";
import { validate } from "../middlewares/validate";
import {
  BusinessSchema,
  LocationSchema,
  ResourceSchema,
} from "../schemas/business";
import { businessOwner, locationCheck } from "../middlewares/businessHandler";
import {
  addBusiness,
  addLocation,
  addResource,
  viewAllBusinesses,
  viewBusiness,
  viewMyBusiness,
} from "../controllers/business";

const router: express.Router = express.Router();

router.post("/", requireAuth, validate(BusinessSchema), addBusiness);
router.post(
  "/:businessId/locations",
  requireAuth,
  businessOwner,
  validate(LocationSchema),
  addLocation,
);
router.post(
  "/:businessId/:locationId/resources",
  requireAuth,
  locationCheck,
  validate(ResourceSchema),
  addResource,
);

router.get("/", viewAllBusinesses);
router.get("/mine", requireAuth, viewMyBusiness);
router.get("/:businessId", viewBusiness);

export default router;

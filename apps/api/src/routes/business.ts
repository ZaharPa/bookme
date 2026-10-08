import express from "express";
import { requireAuth, requireVerified } from "../middlewares/authHandler";
import { validate } from "../middlewares/validate";
import {
  BusinessSchema,
  BusinessUpdateSchema,
  LocationSchema,
  LocationUpdateSchema,
  ResourceSchema,
  ResourceUpdateSchema,
} from "../schemas/business";
import {
  businessOwner,
  locationCheck,
  resourceCheck,
} from "../middlewares/businessHandler";
import {
  addBusiness,
  addLocation,
  addResource,
  updateBusiness,
  updateResource,
  updateLocation,
  viewAllBusinesses,
  viewBusiness,
  viewMyBusiness,
  deleteLocation,
  deleteBusiness,
  deleteResource,
} from "../controllers/business";
import { viewAvailability } from "../controllers/booking";
import { PhotoConfirmSchema, PhotoUploadSchema } from "../schemas/photo";
import {
  confirmPhoto,
  createUploadUrl,
  deletePhoto,
} from "../controllers/photo";

const router: express.Router = express.Router();

router.post(
  "/",
  requireAuth,
  requireVerified,
  validate(BusinessSchema),
  addBusiness,
);
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
router.post(
  "/:businessId/photos/upload-url",
  requireAuth,
  businessOwner,
  validate(PhotoUploadSchema),
  createUploadUrl,
);
router.post(
  "/:businessId/photos",
  requireAuth,
  businessOwner,
  validate(PhotoConfirmSchema),
  confirmPhoto,
);
router.delete(
  "/:businessId/photos/:photoId",
  requireAuth,
  businessOwner,
  deletePhoto,
);
router.get("/", viewAllBusinesses);
router.get("/mine", requireAuth, viewMyBusiness);
router.get("/:businessId", viewBusiness);
router.get("/availability/:resourceId", viewAvailability);
router.patch(
  "/:businessId",
  requireAuth,
  businessOwner,
  validate(BusinessUpdateSchema),
  updateBusiness,
);
router.patch(
  "/:businessId/:locationId",
  requireAuth,
  locationCheck,
  validate(LocationUpdateSchema),
  updateLocation,
);
router.patch(
  "/:businessId/:locationId/:resourceId",
  requireAuth,
  resourceCheck,
  validate(ResourceUpdateSchema),
  updateResource,
);
router.delete("/:businessId", requireAuth, businessOwner, deleteBusiness);
router.delete(
  "/:businessId/:locationId",
  requireAuth,
  locationCheck,
  deleteLocation,
);
router.delete(
  "/:businessId/:locationId/:resourceId",
  requireAuth,
  resourceCheck,
  deleteResource,
);

export default router;

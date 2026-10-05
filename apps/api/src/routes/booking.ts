import express from "express";
import { requireAuth } from "../middlewares/authHandler";
import { createBooking } from "../controllers/booking";
import { validate } from "../middlewares/validate";
import { BookingSchema } from "../schemas/booking";

const router: express.Router = express.Router();

router.get("/mine", requireAuth);
router.get("/business/mine", requireAuth);
router.get("/:bookingId", requireAuth);
router.post("/", requireAuth, validate(BookingSchema), createBooking);
router.patch("/:bookingId/status", requireAuth);
router.patch("/:bookingId/cancel", requireAuth);

export default router;

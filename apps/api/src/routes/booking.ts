import express from "express";
import {
  cancelBooking,
  createBooking,
  updateBookingStatus,
  viewBooking,
  viewBusinessBookings,
  viewMyBookings,
} from "../controllers/booking";
import { validate } from "../middlewares/validate";
import { BookingSchema, BookingStatusSchema } from "../schemas/booking";

const router: express.Router = express.Router();

router.get("/mine", viewMyBookings);
router.get("/business/mine", viewBusinessBookings);
router.get("/:bookingId", viewBooking);
router.post("/", validate(BookingSchema), createBooking);
router.patch(
  "/:bookingId/status",
  validate(BookingStatusSchema),
  updateBookingStatus,
);
router.patch("/:bookingId/cancel", cancelBooking);

export default router;

import express from "express";
import {
  cancelBooking,
  createBooking,
  viewBooking,
  viewBusinessBookings,
  viewMyBookings,
} from "../controllers/booking";
import { validate } from "../middlewares/validate";
import { BookingSchema, BookingStatusSchema } from "../schemas/booking";
import { changeBusinessStatus } from "../controllers/admin";

const router: express.Router = express.Router();

router.get("/mine", viewMyBookings);
router.get("/business/mine", viewBusinessBookings);
router.get("/:bookingId", viewBooking);
router.post("/", validate(BookingSchema), createBooking);
router.patch(
  "/:bookingId/status",
  validate(BookingStatusSchema),
  changeBusinessStatus,
);
router.patch("/:bookingId/cancel", cancelBooking);

export default router;

import { z } from "zod";

const STEP_MS = 15 * 60 * 1000;

export const BookingSchema = z
  .object({
    resourceId: z.uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((d) => d.endTime > d.startTime, {
    error: "endTime must be after startTime",
    path: ["endTime"],
  })
  .refine((d) => d.endTime.getTime() - d.startTime.getTime() >= STEP_MS, {
    error: "Minimum booking is 15 minutes",
    path: ["endTime"],
  })
  .refine(
    (d) =>
      d.startTime.getTime() % STEP_MS === 0 &&
      d.endTime.getTime() % STEP_MS === 0,
    {
      error: "Time must be a multiple of 15 minutes",
      path: ["startTime"],
    },
  );

export const BookingStatusSchema = z.object({
  status: z.enum(["COMPLETED", "NO_SHOW"]),
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

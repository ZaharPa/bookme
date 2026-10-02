import { z } from "zod";

export const BookingSchema = z
  .object({
    resourceId: z.uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((d) => d.endTime > d.startTime, {
    error: "endTime must be after startTime",
    path: ["endTime"],
  });

export type Booking = z.infer<typeof BookingSchema>;

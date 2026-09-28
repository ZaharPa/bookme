import { z } from "zod";

const BUSINESS_TYPES = [
  "RESTAURANT",
  "BARBERSHOP",
  "COWORKING",
  "SALON",
  "FITNESS",
  "MEDICAL",
  "TUTORING",
] as const;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");

const dayHours = z
  .object({ open: time, close: time })
  .refine((d) => d.open < d.close, "Closing time must be after opening")
  .nullable();

const openingHoursSchema = z.object({
  mon: dayHours,
  tue: dayHours,
  wen: dayHours,
  thu: dayHours,
  fri: dayHours,
  sat: dayHours,
  sun: dayHours,
});

const timezone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, "invalid IANA timezone");

export const BusinessSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
  description: z.string().max(2000).optional(),
  phone: z.e164().optional(),
  type: z.enum(BUSINESS_TYPES),
  cancellationWindowHours: z.int().min(0).max(720),
});

export const LocationSchema = z.object({
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(80),
  country: z.string().min(1).max(50),
  openingHours: openingHoursSchema,
  timezone,
});

export const ResourceSchema = z.object({
  capacity: z.int().min(1).max(10000),
  name: z.string().min(1).max(100),
  price: z.number().min(0).max(9999999.99).multipleOf(0.01),
});

export type Business = z.infer<typeof BusinessSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Resource = z.infer<typeof ResourceSchema>;

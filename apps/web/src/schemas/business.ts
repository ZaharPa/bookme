import { z } from "zod";

export const BUSINESS_TYPES = [
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
  wed: dayHours,
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
  name: z.string().min(1, "Name is required").max(255, "Too many characters"),
  email: z.email("Email is required"),
  description: z.string().max(2000, "Too many characters").optional(),
  phone: z.e164().optional(),
  type: z.enum(BUSINESS_TYPES, "Wrong business type"),
  cancellationWindowHours: z.int().min(0).max(720, "Too big window"),
});

export const LocationSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Too many characters"),
  city: z.string().min(1, "City is required").max(80, "Too many characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Too many characters"),
  openingHours: openingHoursSchema,
  timezone,
});

export const ResourceSchema = z.object({
  capacity: z.int().min(1, "Capacity is required").max(10000, "Too big number"),
  name: z.string().min(1, "Name is required").max(100, "Too many characters"),
  priceCents: z
    .number()
    .min(0, "Price is required")
    .max(9999999, "Too big price"),
});

export type Business = z.infer<typeof BusinessSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type OpeningHours = z.infer<typeof openingHoursSchema>;

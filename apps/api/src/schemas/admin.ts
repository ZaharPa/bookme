import { z } from "zod";

export const BusinessStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const StatsQuerySchema = z
  .object({
    from: z.coerce
      .date()
      .default(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    to: z.coerce.date().default(() => new Date()),
  })
  .refine((d) => d.from < d.to, { error: "from must be before to" });
export type BusinessStatus = z.infer<typeof BusinessStatusSchema>;

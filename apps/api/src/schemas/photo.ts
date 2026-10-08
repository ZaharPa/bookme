import { z } from "zod";
import { MAX_PHOTO_BYTES, PHOTO_EXTENSIONS } from "../config/photos";

export const PhotoUploadSchema = z.object({
  contentType: z.enum(Object.keys(PHOTO_EXTENSIONS) as [string, ...string[]]),
  size: z.int().min(1).max(MAX_PHOTO_BYTES),
});

export const PhotoConfirmSchema = z.object({
  key: z.string().min(1).max(200),
});

export type PhotoUpload = z.infer<typeof PhotoUploadSchema>;
export type PhotoConfirm = z.infer<typeof PhotoConfirmSchema>;

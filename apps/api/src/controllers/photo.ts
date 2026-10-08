import type { Request, Response } from "express";
import { db } from "../prisma/db";
import type { PhotoConfirm, PhotoUpload } from "../schemas/photo";
import {
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_BUSINESS,
  PHOTO_EXTENSIONS,
  UPLOAD_URL_TTL_SECONDS,
} from "../config/photos";
import { errorResponse, successResponse } from "../utils/response";
import { randomUUID } from "crypto";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { BUCKET, publicUrl, s3 } from "../utils/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function countPhotos(businessId: string) {
  const result = await db.orm.public.BusinessPhoto.where({
    businessId,
    deletedAt: null,
  }).aggregate((a) => ({ total: a.count() }));
  return result.total;
}

export async function createUploadUrl(
  req: Request<{ businessId: string }, {}, PhotoUpload>,
  res: Response,
) {
  const businessId = req.params.businessId;
  const { contentType, size } = req.body;

  if ((await countPhotos(businessId)) >= MAX_PHOTOS_PER_BUSINESS) {
    return errorResponse(res, 409, `Maximum ${MAX_PHOTOS_PER_BUSINESS} photos`);
  }

  const key = `businesses/${businessId}/${randomUUID()}.${PHOTO_EXTENSIONS[contentType]}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  });

  return successResponse(res, 200, { uploadUrl, key });
}

export async function confirmPhoto(
  req: Request<{ businessId: string }, {}, PhotoConfirm>,
  res: Response,
) {
  const businessId = req.params.businessId;
  const key = req.body.key;

  if (!key.startsWith(`businesses/${businessId}/`))
    return errorResponse(res, 400, "Invalid key");

  const existing = await db.orm.public.BusinessPhoto.where({ key }).first();
  if (existing) return errorResponse(res, 409, "Photo already registed");

  if ((await countPhotos(businessId)) >= MAX_PHOTOS_PER_BUSINESS) {
    return errorResponse(res, 409, `Maximum ${MAX_PHOTOS_PER_BUSINESS} photos`);
  }

  let head;
  try {
    head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    return errorResponse(res, 500, "File not upload");
  }

  const validType = head.ContentType && head.ContentType in PHOTO_EXTENSIONS;
  const validSize = (head.ContentLength ?? 0) <= MAX_PHOTO_BYTES;
  if (!validType || !validSize) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return errorResponse(res, 400, "Invalid type size or file");
  }

  const photo = await db.orm.public.BusinessPhoto.create({ businessId, key });

  return successResponse(
    res,
    201,
    { id: photo.id, url: publicUrl(key) },
    "Photo added successfully",
  );
}

export async function deletePhoto(
  req: Request<{ businessId: string; photoId: string }>,
  res: Response,
) {
  const { businessId, photoId } = req.params;

  const photo = await db.orm.public.BusinessPhoto.where({
    id: photoId,
    businessId,
    deletedAt: null,
  }).first();
  if (!photo) return errorResponse(res, 404, "Photo not found");

  await db.orm.public.BusinessPhoto.where({ id: photo.id }).update({
    deletedAt: new Date().toISOString(),
  });
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: photo.key }));

  return successResponse(res, 200, null, "Photo deleted");
}

import { api } from "../lib/api";
import { type BusinessPhoto } from "../types/BusinessDetails";

type UploadUrlResponse = { uploadUrl: string; key: string };

export async function uploadPhoto(businessId: string, file: File) {
  const { uploadUrl, key } = (await api.post<UploadUrlResponse>(
    `/businesses/${businessId}/photos/upload-url`,
    { contentType: file.type, size: file.size },
  )) as UploadUrlResponse;

  const responsePhoto = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!responsePhoto.ok) throw new Error("Upload to storage failed");

  return api.post<BusinessPhoto>(`/businesses/${businessId}/photos`, { key });
}

export function deletePhoto(businessId: string, photoId: string) {
  return api.delete(`/businesses/${businessId}/photos/${photoId}`);
}

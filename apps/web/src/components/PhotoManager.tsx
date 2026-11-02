import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BusinessPhoto } from "../types/BusinessDetails";
import { deletePhoto, uploadPhoto } from "../queries/photo";
import type { ChangeEvent } from "react";
import { invalidateBusiness } from "../queries/business";

const MAX_PHOTOS = 5;

type Props = { businessId: string; photos: BusinessPhoto[] };

export default function PhotoManager({ businessId, photos }: Props) {
  const queryClient = useQueryClient();

  const refresh = () => invalidateBusiness(queryClient, businessId);

  const upload = useMutation({
    mutationFn: (file: File) => uploadPhoto(businessId, file),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (photoId: string) => deletePhoto(businessId, photoId),
    onSuccess: refresh,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
    e.target.value = "";
  }

  return (
    <div className="mt-10">
      <h2>Photos</h2>
      <p className="muted mt-1">
        {photos.length} of {MAX_PHOTOS} photos
      </p>

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="aspect-4/3 w-full bg-line object-cover"
              />
              <button
                onClick={() => {
                  if (window.confirm("Delete this photo?"))
                    remove.mutate(photo.id);
                }}
                disabled={remove.isPending}
                className="btn-danger mt-2 w-full"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {photos.length < MAX_PHOTOS ? (
        <label className="mt-6 block max-w-md">
          <span className="mb-1 block text-sm font-semibold">Add a photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={upload.isPending}
            className="block w-full text-sm file:mr-3 file:rounded-sm file:border file:border-line file:bg-white file:px-4 file:py-3 file:text-sm file:font-semibold"
          />
        </label>
      ) : (
        <p className="muted mt-6">
          You have reached the limit. Delete a photo to add more
        </p>
      )}

      {upload.isPending && (
        <p role="status" className="muted mt-2">
          Uploading...
        </p>
      )}
    </div>
  );
}

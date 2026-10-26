import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BusinessPhoto } from "../types/BusinessDetails";
import { deletePhoto, uploadPhoto } from "../queries/photo";
import type { ChangeEvent } from "react";

const MAX_PHOTOS = 5;

type Props = { businessId: string; photos: BusinessPhoto[] };

export default function PhotoManager({ businessId, photos }: Props) {
  const queryClient = useQueryClient();

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["business", businessId] }),
      queryClient.invalidateQueries({ queryKey: ["businesses", "mine"] }),
    ]);

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
    <div className="mt-6">
      <h2 className="text-xl font-semibold">Photos</h2>

      <ul className="mt-2 flex flex-wrap gap-2">
        {photos.map((photo) => (
          <li key={photo.id}>
            <img src={photo.url} alt="" className="h-32 w-32 object-cover" />
            <button
              onClick={() => {
                if (window.confirm("Delete this photo?"))
                  remove.mutate(photo.id);
              }}
              disabled={remove.isPending}
              className="mt-1 border p-1"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {photos.length < MAX_PHOTOS && (
        <input
          type="file"
          accept="image/jpeq, image/png, image/webp"
          onChange={handleChange}
          disabled={upload.isPending}
          className="mt-2"
        />
      )}
      {upload.isPending && <p>Uploading...</p>}
      {upload.isError && <p className="text-red-600">{upload.error.message}</p>}
      {remove.isError && <p className="text-red-600">{remove.error.message}</p>}
    </div>
  );
}

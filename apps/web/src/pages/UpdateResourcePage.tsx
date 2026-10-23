import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteResource,
  updateResource,
  useBusiness,
} from "../queries/business";
import type { Resource } from "../schemas/business";
import ResourceForm from "../components/ResourceForm";

export default function UpdateResourcePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { businessId, locationId, resourceId } = useParams();

  const {
    data: business,
    isPending: isLoading,
    isError,
    error: loadError,
  } = useBusiness(businessId!);

  const { mutate, isPending, error } = useMutation({
    mutationFn: (values: Resource) =>
      updateResource(businessId!, locationId!, resourceId!, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["businesses", "mine"],
        }),
        queryClient.invalidateQueries({ queryKey: ["business", businessId] }),
      ]);
      navigate(`/businesses/${businessId}`);
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteResource(businessId!, locationId!, resourceId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["businesses", "mine"],
        }),
        queryClient.invalidateQueries({ queryKey: ["business", businessId] }),
      ]);
      navigate(`/businesses/${businessId}`);
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{loadError.message}</p>;

  const location = business.locations.find((l) => l.id === locationId);
  if (!location) return <p>Location not found</p>;

  const resource = location.resources.find((r) => r.id === resourceId);
  if (!resource) return <p>Resource not found</p>;

  return (
    <>
      <ResourceForm
        defaultValues={{
          name: resource.name,
          priceCents: resource.priceCents,
          capacity: resource.capacity ?? 1,
        }}
        onSubmit={(values) => mutate(values)}
        isPending={isPending}
        error={error?.message}
        submitLabel="Update"
      />

      <button
        onClick={() => {
          if (window.confirm("Delete this resource")) remove();
        }}
        disabled={isDeleting}
        className="mt-4 border p-2"
      >
        Delete
      </button>
    </>
  );
}

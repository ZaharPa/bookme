import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteResource,
  invalidateBusiness,
  updateResource,
  useBusiness,
} from "../queries/business";
import type { Resource } from "../schemas/business";
import ResourceForm from "../components/ResourceForm";
import { toast } from "sonner";

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

  const { mutate, isPending } = useMutation({
    mutationFn: (values: Resource) =>
      updateResource(businessId!, locationId!, resourceId!, values),
    onSuccess: async () => {
      toast.success("Resource saved");
      await invalidateBusiness(queryClient, businessId);
      navigate(`/businesses/${businessId}`);
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteResource(businessId!, locationId!, resourceId!),
    onSuccess: () => {
      navigate(`/businesses/${businessId}`);
      void invalidateBusiness(queryClient, businessId);
    },
  });

  if (isLoading) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {loadError.message}
      </p>
    );

  const location = business.locations.find((l) => l.id === locationId);
  if (!location) return <p className="muted">Location not found</p>;

  const resource = location.resources.find((r) => r.id === resourceId);
  if (!resource) return <p className="muted">Resource not found</p>;

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
        submitLabel="Update"
      />

      <section className="mt-12 max-w-lg border-t border-line pt-6">
        <h2 className="text-base">Delete resource</h2>
        <p className="muted mt-1">Guests will no longer be able to book this</p>
        <button
          onClick={() => {
            if (window.confirm("Delete this resource?")) remove();
          }}
          disabled={isDeleting}
          className="btn-danger mt-4"
        >
          Delete resource
        </button>
      </section>
    </>
  );
}

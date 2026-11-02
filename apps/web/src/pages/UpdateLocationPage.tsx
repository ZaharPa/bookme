import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Location } from "../schemas/business";
import {
  deleteLocation,
  invalidateBusiness,
  updateLocation,
  useBusiness,
} from "../queries/business";
import LocationForm from "../components/LocationForm";
import { toast } from "sonner";

export default function UpdateLocationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { businessId, locationId } = useParams();

  const {
    data: business,
    isPending: isLoading,
    isError,
    error: loadError,
  } = useBusiness(businessId!);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: Location) =>
      updateLocation(businessId!, locationId!, values),
    onSuccess: async () => {
      toast.success("Location saved");
      await invalidateBusiness(queryClient, businessId);
      navigate(`/businesses/${businessId}`);
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteLocation(businessId!, locationId!),
    onSuccess: async () => {
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

  return (
    <>
      <LocationForm
        defaultValues={{
          country: location.country,
          city: location.city,
          address: location.address,
          timezone: location.timezone,
          openingHours: location.openingHours,
        }}
        onSubmit={(values) => mutate(values)}
        isPending={isPending}
        submitLabel="Update"
      />

      <section className="mt-12 max-w-lg border-t border-line pt-6">
        <h2 className="text-base">Delete location</h2>
        <p className="muted mt-1">Its resources are deleted too.</p>
        <button
          onClick={() => {
            if (window.confirm("Delete this location?")) remove();
          }}
          disabled={isDeleting}
          className="btn-danger mt-4"
        >
          Delete location
        </button>
      </section>
    </>
  );
}

import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Location } from "../schemas/business";
import {
  deleteLocation,
  updateLocation,
  useBusiness,
} from "../queries/business";
import LocationForm from "../components/LocationForm";

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

  const { mutate, isPending, error } = useMutation({
    mutationFn: (values: Location) =>
      updateLocation(businessId!, locationId!, values),
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
    mutationFn: () => deleteLocation(businessId!, locationId!),
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
        error={error?.message}
        submitLabel="Update"
      />

      <button
        onClick={() => {
          if (window.confirm("Delete this location")) remove();
        }}
        disabled={isDeleting}
        className="mt-4 border p-2"
      >
        Delete
      </button>
    </>
  );
}

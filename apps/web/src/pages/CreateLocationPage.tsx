import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocation } from "../queries/business";
import LocationForm from "../components/LocationForm";
import type { Location } from "../schemas/business";

export default function CreateLocationPage() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (location: Location) => createLocation(businessId!, location),
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

  return (
    <LocationForm
      onSubmit={(values) => mutate(values)}
      isPending={isPending}
      error={error?.message}
      submitLabel="Create"
    />
  );
}

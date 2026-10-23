import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createResource } from "../queries/business";
import type { Resource } from "../schemas/business";
import ResourceForm from "../components/ResourceForm";

export default function CreateResourcePage() {
  const navigate = useNavigate();
  const { businessId, locationId } = useParams();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (resource: Resource) =>
      createResource(businessId!, locationId!, resource),
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
    <ResourceForm
      onSubmit={(values) => mutate(values)}
      isPending={isPending}
      error={error?.message}
      submitLabel="Create"
    />
  );
}

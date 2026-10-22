import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Business } from "../schemas/business";
import { updateBusiness, useBusiness } from "../queries/business";
import BusinessForm from "../components/BusinessForm";

export default function UpdateBusinessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { businessId } = useParams();

  const {
    data: business,
    isPending: isLoading,
    isError,
    error: loadError,
  } = useBusiness(businessId!);

  const { mutate, isPending, error } = useMutation({
    mutationFn: (values: Business) => updateBusiness(businessId!, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["businesses", "mine"],
        }),
        queryClient.invalidateQueries({ queryKey: ["business", businessId] }),
      ]);
      navigate("/businesses/mine");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{loadError.message}</p>;

  return (
    <>
      <BusinessForm
        defaultValues={{
          name: business.name,
          email: business.email,
          phone: business.phone ?? undefined,
          description: business.description ?? undefined,
          type: business.type,
          cancellationWindowHours: business.cancellationWindowHours,
        }}
        onSubmit={(values) => mutate(values)}
        isPending={isPending}
        error={error?.message}
        submitLabel="Update"
      />{" "}
    </>
  );
}

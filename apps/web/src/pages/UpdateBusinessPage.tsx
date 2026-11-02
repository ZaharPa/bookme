import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Business } from "../schemas/business";
import {
  invalidateBusiness,
  updateBusiness,
  useBusiness,
} from "../queries/business";
import BusinessForm from "../components/BusinessForm";
import PhotoManager from "../components/PhotoManager";
import { toast } from "sonner";

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

  const { mutate, isPending } = useMutation({
    mutationFn: (values: Business) => updateBusiness(businessId!, values),
    onSuccess: async () => {
      toast.success("Business saved");
      await invalidateBusiness(queryClient, businessId);
      navigate("/businesses/mine");
    },
  });

  if (isLoading) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {loadError.message}
      </p>
    );

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
        submitLabel="Update"
      />

      <PhotoManager businessId={business.id} photos={business.photos} />
    </>
  );
}

import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBusiness } from "../queries/business";
import VerifyEmailBanner from "../components/VerifyEmailBanner";
import BusinessForm from "../components/BusinessForm";
import { toast } from "sonner";

export default function CreateBusinessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      toast.success(
        "Business created. It will appear on the site after an admin approves it.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["businesses"],
      });
      navigate("/businesses/mine");
    },
  });

  if (!user?.emailVerifiedAt) return <VerifyEmailBanner />;

  return (
    <>
      <BusinessForm
        onSubmit={(values) => mutate(values)}
        isPending={isPending}
        submitLabel="Create"
      />
    </>
  );
}

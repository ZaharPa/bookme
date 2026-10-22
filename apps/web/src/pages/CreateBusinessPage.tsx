import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBusiness } from "../queries/business";
import VerifyEmailBanner from "../components/VerifyEmailBanner";
import BusinessForm from "../components/BusinessForm";

export default function CreateBusinessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["businesses", "mine"],
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
        error={error?.message}
        submitLabel="Create"
      />
    </>
  );
}

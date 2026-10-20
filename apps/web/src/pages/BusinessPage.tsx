import { useParams } from "react-router";
import { useBusiness } from "../queries/business";

export default function BusinessPage() {
  const { businessId } = useParams();

  const { data, isPending, isError, error } = useBusiness(businessId!);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  return (
    <div>
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
}

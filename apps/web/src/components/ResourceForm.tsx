import { zodResolver } from "@hookform/resolvers/zod";
import { ResourceSchema, type Resource } from "../schemas/business";
import { useForm } from "react-hook-form";

type Props = {
  defaultValues?: Resource;
  onSubmit: (values: Resource) => void;
  isPending: boolean;
  error?: string;
  submitLabel: string;
};

export default function ResourceForm({
  defaultValues,
  onSubmit,
  isPending,
  error,
  submitLabel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Resource>({
    resolver: zodResolver(ResourceSchema),
    defaultValues,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">{submitLabel} resource</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <input placeholder="Name" {...register("name")} />
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <input
            type="number"
            placeholder="Price in cents"
            {...register("priceCents", { valueAsNumber: true })}
          />
          {errors.priceCents && (
            <p className="text-red-600">{errors.priceCents.message}</p>
          )}
        </div>

        <div>
          <input
            type="number"
            placeholder="Capacity"
            {...register("capacity", { valueAsNumber: true })}
          />
          {errors.capacity && (
            <p className="text-red-600">{errors.capacity.message}</p>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 border p-2 bg-white text-blue-800 cursor-pointer"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

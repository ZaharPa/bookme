import { zodResolver } from "@hookform/resolvers/zod";
import { ResourceSchema, type Resource } from "../schemas/business";
import { useForm } from "react-hook-form";
import Field from "./Field";

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
      <h1>{submitLabel} resource</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 max-w-lg space-y-5"
      >
        <Field
          label="Name"
          hint="What guests book: a court, a desk, a chair"
          error={errors.name?.message ?? ""}
        >
          <input {...register("name")} />
        </Field>

        <Field
          label="Price per hour (cents)"
          hint="2500 means 25.00 $"
          error={errors.priceCents?.message ?? ""}
        >
          <input
            type="number"
            {...register("priceCents", { valueAsNumber: true })}
          />
        </Field>

        <Field
          label="Capacity"
          hint="How many bookings can overlap in time. Use 1 for a chair, room or table."
          error={errors.capacity?.message ?? ""}
        >
          <input
            type="number"
            {...register("capacity", { valueAsNumber: true })}
          />
        </Field>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn">
          {isPending ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

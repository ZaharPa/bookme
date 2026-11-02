import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUSINESS_TYPES,
  BusinessSchema,
  type Business,
} from "../schemas/business";
import { useForm } from "react-hook-form";
import Field from "./Field";

type Props = {
  defaultValues?: Business;
  onSubmit: (values: Business) => void;
  isPending: boolean;
  submitLabel: string;
};

const typeLabel = (type: string) => type[0] + type.slice(1).toLowerCase();

export default function BusinessForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Business>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: { cancellationWindowHours: 24, ...defaultValues },
  });
  return (
    <div>
      <h1>{submitLabel} business</h1>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 max-w-lg space-y-5"
      >
        <Field label="Name" error={errors.name?.message ?? ""}>
          <input {...register("name")} />
        </Field>

        <Field label="Email" error={errors.email?.message ?? ""}>
          <input {...register("email")} />
        </Field>

        <Field
          label="Phone (optional)"
          hint="With country code, for example +380991234567"
          error={errors.phone?.message ?? ""}
        >
          <input
            type="tel"
            {...register("phone", {
              setValueAs: (v: string) => v || undefined,
            })}
          />
        </Field>

        <Field label="Type" error={errors.type?.message ?? ""}>
          <select {...register("type")}>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Description (optional)"
          error={errors.description?.message ?? ""}
        >
          <input
            {...register("description", {
              setValueAs: (v: string) => v || undefined,
            })}
          />
        </Field>

        <Field
          label="Cancellation window (hours)"
          hint="Guests can cancel a confirmed booking up to this many hours before it starts."
          error={errors.cancellationWindowHours?.message ?? ""}
        >
          <input
            {...register("cancellationWindowHours", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <button type="submit" disabled={isPending} className="btn">
          {isPending ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

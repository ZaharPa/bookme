import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUSINESS_TYPES,
  BusinessSchema,
  type Business,
} from "../schemas/business";
import { useForm } from "react-hook-form";

type Props = {
  defaultValues?: Business;
  onSubmit: (values: Business) => void;
  isPending: boolean;
  error?: string;
  submitLabel: string;
};

export default function BusinessForm({
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
  } = useForm<Business>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: { cancellationWindowHours: 24, ...defaultValues },
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">{submitLabel}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <input placeholder="Name" {...register("name")} />
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <input placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            placeholder="Phone (optional)"
            {...register("phone", {
              setValueAs: (v: string) => v || undefined,
            })}
          />
          {errors.phone && (
            <p className="text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <select {...register("type")}>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-red-600">{errors.type.message}</p>}
        </div>

        <div>
          <textarea
            placeholder="Description (optional)"
            {...register("description", {
              setValueAs: (v: string) => v || undefined,
            })}
          />
          {errors.description && (
            <p className="text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <input
            type="number"
            {...register("cancellationWindowHours", {
              valueAsNumber: true,
            })}
          />
          {errors.cancellationWindowHours && (
            <p className="text-red-600">
              {errors.cancellationWindowHours.message}
            </p>
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

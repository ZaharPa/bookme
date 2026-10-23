import { useForm, useWatch } from "react-hook-form";
import { LocationSchema, type Location } from "../schemas/business";
import { zodResolver } from "@hookform/resolvers/zod";

const DAYS = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
] as const;

const WORK_DAY = { open: "09:00", close: "18:00" };

const DEFAULT_HOURS = {
  mon: WORK_DAY,
  tue: WORK_DAY,
  wed: WORK_DAY,
  thu: WORK_DAY,
  fri: WORK_DAY,
  sat: null,
  sun: null,
};

type Props = {
  defaultValues?: Location;
  onSubmit: (values: Location) => void;
  isPending: boolean;
  error?: string;
  submitLabel: string;
};

export default function LocationForm({
  defaultValues,
  onSubmit,
  isPending,
  error,
  submitLabel,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Location>({
    resolver: zodResolver(LocationSchema),
    defaultValues: defaultValues ?? {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      openingHours: DEFAULT_HOURS,
    },
  });

  const openingHours = useWatch({ control, name: "openingHours" });

  return (
    <div>
      <h1 className="text-3xl font-bold">{submitLabel} location</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <input placeholder="Country" {...register("country")} />
          {errors.country && (
            <p className="text-red-600">{errors.country.message}</p>
          )}
        </div>

        <div>
          <input placeholder="City" {...register("city")} />
          {errors.city && <p className="text-red-600">{errors.city.message}</p>}
        </div>

        <div>
          <input placeholder="Address" {...register("address")} />
          {errors.address && (
            <p className="text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <input placeholder="Timezone" {...register("timezone")} />
          {errors.timezone && (
            <p className="text-red-600">{errors.timezone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          {DAYS.map(([day, label]) => {
            const hours = openingHours[day];
            return (
              <div key={day} className="flex items-center gap-2">
                <label className="w-32 flex gap-1">
                  <input
                    type="checkbox"
                    checked={!!hours}
                    onChange={(e) =>
                      setValue(
                        `openingHours.${day}`,
                        e.target.checked ? WORK_DAY : null,
                        { shouldValidate: true },
                      )
                    }
                  />
                  |{label}
                </label>
                {hours ? (
                  <>
                    <input
                      type="time"
                      {...register(`openingHours.${day}.open`)}
                    />
                    <input
                      type="time"
                      {...register(`openingHours.${day}.close`)}
                    />
                  </>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
                {errors.openingHours?.[day]?.message && (
                  <p className="text-red-600">
                    {errors.openingHours?.[day]?.message}
                  </p>
                )}
              </div>
            );
          })}
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

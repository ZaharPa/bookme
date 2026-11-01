import { useForm, useWatch } from "react-hook-form";
import { LocationSchema, type Location } from "../schemas/business";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "./Field";

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
      <h1>{submitLabel} location</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 max-w-lg space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country" error={errors.country?.message ?? ""}>
            <input {...register("country")} />
          </Field>
          <Field label="City" error={errors.city?.message ?? ""}>
            <input {...register("city")} />
          </Field>
        </div>

        <Field label="Address" error={errors.address?.message ?? ""}>
          <input {...register("address")} />
        </Field>

        <Field
          label="Timezone"
          hint="For example Europe/Kyiv. Opening hours use this time zone"
          error={errors.timezone?.message ?? ""}
        >
          <input {...register("timezone")} />
        </Field>

        <fieldset>
          <legend className="label">Opening hours</legend>
          <div className="sheet">
            {DAYS.map(([day, label]) => {
              const hours = openingHours[day];
              return (
                <div
                  key={day}
                  className="sheet-row flex flex-wrap items-center gap-3 py-3"
                >
                  <label className="w-36 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-ink"
                      checked={!!hours}
                      onChange={(e) =>
                        setValue(
                          `openingHours.${day}`,
                          e.target.checked ? WORK_DAY : null,
                          { shouldValidate: true },
                        )
                      }
                    />
                    {label}
                  </label>
                  {hours ? (
                    <>
                      <input
                        type="time"
                        aria-label={`${label} opens`}
                        {...register(`openingHours.${day}.open`)}
                      />
                      <span className="text-muted">to</span>
                      <input
                        type="time"
                        aria-label={`${label} closes`}
                        {...register(`openingHours.${day}.close`)}
                      />
                    </>
                  ) : (
                    <span className="text-muted">Closed</span>
                  )}
                  {errors.openingHours?.[day]?.message && (
                    <p className="field-error w-full">
                      {errors.openingHours?.[day]?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" disabled={isPending} className="btn">
          {isPending ? "Saving..." : submitLabel}
        </button>
      </form>
    </div>
  );
}

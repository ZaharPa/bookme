import { Link, useParams } from "react-router";
import { useBusiness } from "../queries/business";
import { formatPrice, humanize } from "../utils/format";
import { DAYS } from "../utils/days";

export default function BusinessPage() {
  const { businessId } = useParams();
  const { data, isPending, isError, error } = useBusiness(businessId!);

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {error.message}
      </p>
    );
  return (
    <div className="max-w-4xl">
      <p className="muted">{humanize(data.type)}</p>
      <h1 className="mt-1">{data.name}</h1>
      {data.description && (
        <p className="mt-3 max-w-prose">{data.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-6">
        {data.phone && (
          <a href={`tel:${data.phone}`} className="link">
            {data.phone}
          </a>
        )}
        <a href={`mailto:${data.email}`} className="link">
          {data.email}
        </a>
      </div>
      <p className="muted mt-3">
        You can cancel a confirmed booking up to {data.cancellationWindowHours}{" "}
        hours before it starts.
      </p>

      {data.photos.length > 0 && (
        <ul className="my-8 grid grid-cols-2 gap-2 md:grid-cols-3">
          {data.photos.map((photo, index) => (
            <li key={photo.id}>
              <img
                src={photo.url}
                alt={`${data.name}, photo ${index + 1}`}
                className="aspect-4/3 w-full bg-line object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      {data.locations.length === 0 && (
        <p className="muted mt-10">Nothing to book yet</p>
      )}

      {data.locations.map((location) => (
        <section key={location.id}>
          <h2>
            {location.address}, {location.city}
          </h2>

          <div className="mt-4 grid gap-8 md:grid-cols-3">
            {location.resources.length === 0 ? (
              <p className="muted md:col-span-2">Nothing to book here yet</p>
            ) : (
              <div className="table-wrap md:col-span-2">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>
                        <span className="sr-only">Book</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {location.resources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="font-semibold">{resource.name}</td>
                        <td className="tabular-nums">
                          {formatPrice(resource.priceCents)} per hour
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/businesses/${data.id}/locations/${location.id}/resources/${resource.id}/book`}
                            className="btn"
                          >
                            Book a time
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="panel">
              <h3 className="label">Opening hours</h3>
              <dl>
                {DAYS.map(([day, label]) => {
                  const hours = location.openingHours[day];
                  return (
                    <div key={day} className="flex justify-between py-1">
                      <dt>{label}</dt>
                      <dd className="tabular-nums">
                        {hours ? `${hours.open}-${hours.close}` : "Closed"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

import { useBusinesses } from "../queries/business";
import { Link } from "react-router";
import { BUSINESS_TYPES } from "../schemas/business";
import { humanize } from "../utils/format";
import FeaturedPlace from "../components/FeaturedPlace";

export default function HomePage() {
  const { data, isPending, isError, error } = useBusinesses(1, "", 3);
  const [first, ...rest] = data?.items ?? [];

  return (
    <div>
      <section className="max-w-3xl">
        <h1 className="text-5xl leading-[1.05] tracking-tight">
          Find a place and book a time
        </h1>
        <p className="mt-4 max-w-prose text-lg text-muted">
          Fitness studios, coworking desks, barbers and more. Pick a place,
          choose a time, pay online.
        </p>
        <Link to="/places" className="btn mt-6">
          Browse places
        </Link>
      </section>

      <section className="mt-16">
        <h2>Browse by type</h2>
        <nav
          aria-label="Place types"
          className="mt-3 flex flex-wrap gap-x-6 gap-y-2"
        >
          {BUSINESS_TYPES.map((type) => (
            <Link key={type} to={`/places?type=${type}`} className="link">
              {humanize(type)}
            </Link>
          ))}
        </nav>
      </section>

      <section className="mt-16">
        <h2>New places</h2>

        {isPending && <p className="muted mt-3">Loading…</p>}
        {isError && (
          <p className="field-error mt-3" role="alert">
            {error.message}
          </p>
        )}
        {data && !first && <p className="muted mt-3">No places yet.</p>}

        {first && (
          <div className="mt-6 grid gap-8 md:grid-cols-[3fr_2fr]">
            <FeaturedPlace business={first} large />
            <div className="flex flex-col gap-8">
              {rest.map((business) => (
                <FeaturedPlace key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        <Link to="/places" className="link mt-8 inline-block">
          See all places
        </Link>
      </section>

      <section className="panel mt-16 max-w-2xl">
        <h2>Run a business?</h2>
        <p className="mt-1 text-muted">
          Add your place to BookMe, set your opening hours and let customers
          book and pay online.
        </p>
        <Link to="/businesses/create" className="btn-secondary mt-4">
          Add your business
        </Link>
      </section>
    </div>
  );
}

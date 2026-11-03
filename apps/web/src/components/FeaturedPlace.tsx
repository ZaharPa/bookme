import { Link } from "react-router";
import type { BusinessDetails } from "../types/BusinessDetails";
import { lowerPriceCents } from "../utils/business";
import { formatPrice, humanize } from "../utils/format";

type Props = { business: BusinessDetails; large?: boolean };

export default function FeaturedPlace({ business, large = false }: Props) {
  const photo = business.photos[0];
  const city = business.locations[0]?.city;
  const price = lowerPriceCents(business);
  const ratio = large ? "aspect-4/3" : "aspect-16/9";

  return (
    <Link to={`/businesses/${business.id}`} className="group block">
      {photo && (
        <img
          src={photo.url}
          alt=""
          className={`w-full bg-line object-cover ${ratio}`}
        />
      )}
      <h3
        className={`mt-3 font-semibold group-hover:underline ${large ? "text-2xl" : "text-lg"}`}
      >
        {business.name}
      </h3>
      <p className="muted">
        {humanize(business.type)}
        {city && `, ${city}`}
        {price !== null && `. From ${formatPrice(price)} per hour`}
      </p>
    </Link>
  );
}

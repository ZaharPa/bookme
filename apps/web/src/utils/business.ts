import type { BusinessDetails } from "../types/BusinessDetails";
import { DAY_KEYS } from "./days";

type WithLocations = Pick<BusinessDetails, "locations">;

const TODAY = DAY_KEYS[new Date().getDay()];

export function hoursToday(business: WithLocations) {
  const location = business.locations[0];
  return location ? location.openingHours[TODAY] : undefined;
}

export function lowerPriceCents(business: WithLocations) {
  const prices = business.locations.flatMap((l) =>
    l.resources.map((r) => r.priceCents),
  );
  return prices.length > 0 ? Math.min(...prices) : null;
}

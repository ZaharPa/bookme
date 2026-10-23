import type { OpeningHours } from "../schemas/business";

export type BusinessType =
  | "RESTAURANT"
  | "BARBERSHOP"
  | "COWORKING"
  | "SALON"
  | "FITNESS"
  | "MEDICAL"
  | "TUTORING";

export type Resource = {
  id: string;
  name: string;
  priceCents: number;
  capacity: number | null;
};

export type Location = {
  id: string;
  country: string;
  city: string;
  address: string;
  timezone: string;
  openingHours: OpeningHours;
  resources: Resource[];
};

export type BusinessPhoto = {
  id: string;
  url: string;
};

export type BusinessDetails = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: BusinessType;
  description: string | null;
  cancellationWindowHours: number;
  locations: Location[];
  photos: BusinessPhoto[];
};

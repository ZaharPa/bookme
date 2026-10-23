import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Paginated } from "../types/Paginated";
import type { BusinessDetails } from "../types/BusinessDetails";
import { ApiError } from "../lib/error";
import { useAuth } from "../hooks/useAuth";
import type { Business, Location, Resource } from "../schemas/business";

export function useBusinesses(page: number) {
  return useQuery({
    queryKey: ["businesses", page],
    queryFn: () =>
      api.get<Paginated<BusinessDetails>>(`/businesses?page=${page}`),
    placeholderData: keepPreviousData,
  });
}

export function useBusiness(businessId: string) {
  return useQuery({
    queryKey: ["business", businessId],
    queryFn: () => api.get<BusinessDetails>(`/businesses/${businessId}`),
    enabled: !!businessId,
    retry: (faiureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && faiureCount < 3,
  });
}

export function useMyBusinesses(page: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["businesses", "mine", user?.id, page],
    queryFn: () =>
      api.get<Paginated<BusinessDetails>>(`/businesses/mine?page=${page}`),
    enabled: !!user,
  });
}

export function createBusiness(business: Business) {
  return api.post<BusinessDetails>("/businesses", business);
}

export function updateBusiness(businessId: string, business: Business) {
  return api.patch<BusinessDetails>(`/businesses/${businessId}`, business);
}

export function deleteBusiness(businessId: string) {
  return api.delete(`/businesses/${businessId}`);
}

export function createLocation(businessId: string, location: Location) {
  return api.post<Location>(`/businesses/${businessId}/locations`, location);
}

export function updateLocation(
  businessId: string,
  locationId: string,
  location: Location,
) {
  return api.patch<Location>(
    `/businesses/${businessId}/${locationId}`,
    location,
  );
}

export function deleteLocation(businessId: string, locationId: string) {
  return api.delete(`/businesses/${businessId}/${locationId}`);
}

export function createResource(
  businessId: string,
  locationId: string,
  resource: Resource,
) {
  return api.post<Resource>(
    `/businesses/${businessId}/${locationId}/resources`,
    resource,
  );
}

export function updateResource(
  businessId: string,
  locationId: string,
  resourceId: string,
  resource: Resource,
) {
  return api.patch<Resource>(
    `/businesses/${businessId}/${locationId}/${resourceId}`,
    resource,
  );
}

export function deleteResource(
  businessId: string,
  locationId: string,
  resourceId: string,
) {
  return api.delete(`/businesses/${businessId}/${locationId}/${resourceId}`);
}

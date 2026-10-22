import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Paginated } from "../types/Paginated";
import type { BusinessDetails } from "../types/BusinessDetails";
import { ApiError } from "../lib/error";
import { useAuth } from "../hooks/useAuth";
import type { Business } from "../schemas/business";

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

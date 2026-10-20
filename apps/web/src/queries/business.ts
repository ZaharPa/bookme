import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Paginated } from "../types/Paginated";
import type { Business } from "../types/Business";
import type { BusinessDetails } from "../types/BusinessDetails";
import { ApiError } from "../lib/error";

export function useBusinesses(page: number) {
  return useQuery({
    queryKey: ["businesses", page],
    queryFn: () => api.get<Paginated<Business>>(`/businesses?page=${page}`),
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

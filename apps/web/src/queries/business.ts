import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Paginated } from "../types/Paginated";
import type { Business } from "../types/Business";

export function useBusinesses(page: number) {
  return useQuery({
    queryKey: ["businesses", page],
    queryFn: () => api.get<Paginated<Business>>(`/businesses?page=${page}`),
    placeholderData: keepPreviousData,
  });
}

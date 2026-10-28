import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Paginated } from "../types/Paginated";
import type {
  AdminBusinesses,
  AdminUser,
  Stats,
  BusinessStatus,
} from "../types/admin";

export function useAdminBusinesses(page: number, status: string) {
  return useQuery({
    queryKey: ["admin", "businesses", page, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("status", status);
      return api.get<Paginated<AdminBusinesses>>(`/admin/businesses/${params}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function changeBusinessStatus(
  businessId: string,
  status: BusinessStatus,
) {
  return api.patch(`/admin/businesses/${businessId}/status`, { status });
}

export function useAdminUsers(page: number) {
  return useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => api.get<Paginated<AdminUser>>(`/admin/users?page=${page}`),
    placeholderData: keepPreviousData,
  });
}

export function banUser(userId: string) {
  return api.patch(`/admin/users/${userId}/ban`);
}

export function unbanUser(userId: string) {
  return api.patch(`/admin/users/${userId}/unban`);
}

export function useStats(from: string, to: string) {
  return useQuery({
    queryKey: ["admin", "stats", from, to],
    queryFn: () => {
      const start = new Date(`${from}T00:00`);
      const end = new Date(`${to}T00:00`);
      end.setDate(end.getDate() + 1);
      const params = new URLSearchParams({
        from: start.toISOString(),
        to: end.toISOString(),
      });
      return api.get<Stats>(`/admin/stats?${params}`);
    },
    enabled: !!from && !!to,
  });
}

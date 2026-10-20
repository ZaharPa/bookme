import type { AccessToken } from "../types/AccessToken";
import { ApiError } from "./error";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

let accessToken: string | null = null;
let onSessionExpired: () => void = () => {};
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(
  path: string,
  options?: RequestInit,
  retried = false,
) {
  const headers = new Headers(options?.headers);
  if (accessToken !== null)
    headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !retried && !path.startsWith("/auth/")) {
    const token = await refreshSession();
    if (token) return request<T>(path, options, true);
    setAccessToken(null);
    onSessionExpired();
  }

  const body = await response.json();

  if (!response.ok) {
    const error = body.error;
    if (Array.isArray(error)) {
      throw new ApiError(response.status, "Invalid data", error);
    }
    throw new ApiError(
      response.status,
      typeof error === "string" ? error : "Request failed",
    );
  }
  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};

async function doRefresh() {
  try {
    const data = await request<AccessToken>("/auth/refresh", {
      method: "POST",
    });
    setAccessToken(data.accessToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

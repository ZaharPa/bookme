import { ApiError } from "../config/ApiError";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  if (accessToken !== null)
    headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, body.error);
  }
  return body.data;
}

export const api = {
  get: (path: string) => request(path),
  delete: (path: string) => request(path, { method: "DELETE" }),
  post: (path: string, data?: unknown) =>
    request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  patch: (path: string, data?: unknown) =>
    request(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};

async function doRefresh() {
  try {
    const data = await request("/auth/refresh", { method: "POST" });
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

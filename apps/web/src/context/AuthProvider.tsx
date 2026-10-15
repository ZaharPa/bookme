import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import type { User } from "../types/User";
import { api, refreshSession, setAccessToken } from "../lib/api";
import type { AccessToken } from "../types/AccessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function load() {
      try {
        const token = await refreshSession();
        if (token !== null) {
          setUser(await api.get("/users/me"));
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  async function registration(name: string, email: string, password: string) {
    const data = await api.post<AccessToken>("/auth/registration", {
      name,
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(await api.get<User>("/users/me"));
  }

  async function login(email: string, password: string) {
    const data = await api.post<AccessToken>("/auth/login", {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(await api.get<User>("/users/me"));
  }

  async function logout() {
    await api.post<AccessToken>("/auth/logout");
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext value={{ user, isLoading, registration, login, logout }}>
      {children}
    </AuthContext>
  );
}

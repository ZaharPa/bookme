import { createContext } from "react";
import type { User } from "../types/User";

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  registration: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

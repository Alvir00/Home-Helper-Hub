import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth as useReplitAuth } from "@workspace/replit-auth-web";
import type { AuthUser } from "@workspace/replit-auth-web";

export interface AppUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  role: string;
  profileImageUrl: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  updateUser: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(authUser: AuthUser | null | undefined): AppUser | null {
  if (!authUser || authUser.dbId == null) return null;
  return {
    id: authUser.dbId,
    name:
      authUser.name ??
      ([authUser.firstName, authUser.lastName].filter(Boolean).join(" ") ||
        authUser.email ||
        "User"),
    email: authUser.email ?? null,
    phone: authUser.phone ?? null,
    address: authUser.address ?? null,
    neighborhood: authUser.neighborhood ?? null,
    role: authUser.role ?? "household",
    profileImageUrl: authUser.profileImageUrl ?? null,
  };
}

function AuthStateProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isLoading, isAuthenticated, login, logout } =
    useReplitAuth();
  const [overrideUser, setOverrideUser] = useState<
    AppUser | null | undefined
  >(undefined);

  const mappedUser = toAppUser(authUser);
  const user = overrideUser !== undefined ? overrideUser : mappedUser;

  useEffect(() => {
    setOverrideUser(undefined);
  }, [authUser?.id]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: isAuthenticated && user != null,
    isAdmin: (user?.role ?? authUser?.role) === "admin",
    isLoading,
    updateUser: (u: AppUser) => setOverrideUser(u),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthStateProvider>{children}</AuthStateProvider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

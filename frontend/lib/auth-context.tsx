"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "./api";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refreshUser() {
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("madrasa_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ access_token: string; user: User }>("/auth/login", { email, password });
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  }

  async function register(payload: Record<string, unknown>) {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const fd = new FormData();
    const photo = payload.photo;
    for (const [k, v] of Object.entries(payload)) {
      if (k === "photo" || v === undefined || v === null || v === "") continue;
      if (k === "role") continue; // backend haitaji role kwenye Form
      fd.append(k, String(v));
    }
    if (photo instanceof File) {
      fd.append("photo", photo);
    }
    const res = await fetch(`${API}/auth/register`, { method: "POST", body: fd });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = typeof body.detail === "string"
          ? body.detail
          : Array.isArray(body.detail)
            ? body.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ")
            : JSON.stringify(body.detail || body);
      } catch { /* ignore */ }
      const { ApiError } = await import("./api");
      throw new ApiError(detail, res.status);
    }
    return null as unknown as User;
  }



  function logout() {
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

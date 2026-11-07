"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthToken, clearAuthToken, getAuthToken } from "@/lib/api";

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  employee_id?: number;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: "admin" | "manager" | "employee") => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = getAuthToken();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
        } catch {
          // Token expired, fallback to demo manager
          tryDemoFallback();
        }
      } else {
        tryDemoFallback();
      }
      setLoading(false);
    }

    async function tryDemoFallback() {
      try {
        const res = await api.demoLogin("manager");
        setAuthToken(res.access_token);
        setUser(res.user);
      } catch (err) {
        console.error("Demo login init failed", err);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAuthToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const switchDemoRole = async (targetRole: "admin" | "manager" | "employee") => {
    setLoading(true);
    try {
      const res = await api.demoLogin(targetRole);
      setAuthToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      console.error("Failed to switch demo role", err);
    } finally {
      setLoading(false);
    }
  };

  const resetDemoData = async () => {
    await api.resetDemoData();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role as UserRole) || "MANAGER",
        loading,
        login,
        logout,
        switchDemoRole,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

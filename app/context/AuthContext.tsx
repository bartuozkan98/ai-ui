"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  bankIban?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// localStorage-based auth for demo. Replace with Supabase/Firebase later.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("renthub_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("renthub_users") || "[]");
    const found = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "E-posta veya şifre hatalı" };
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("renthub_user", JSON.stringify(userData));
    return { success: true };
  };

  const register = async (data: { email: string; password: string; name: string; phone: string }) => {
    const users = JSON.parse(localStorage.getItem("renthub_users") || "[]");
    if (users.find((u: { email: string }) => u.email === data.email)) {
      return { success: false, error: "Bu e-posta zaten kayıtlı" };
    }
    const newUser = {
      id: "user_" + Date.now(),
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("renthub_users", JSON.stringify(users));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem("renthub_user", JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("renthub_user");
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("renthub_user", JSON.stringify(updated));
    // Update in users list too
    const users = JSON.parse(localStorage.getItem("renthub_users") || "[]");
    const idx = users.findIndex((u: { id: string }) => u.id === user.id);
    if (idx >= 0) { users[idx] = { ...users[idx], ...data }; localStorage.setItem("renthub_users", JSON.stringify(users)); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

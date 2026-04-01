"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "firebase/auth";
import LoginScreen from "./LoginScreen";

interface AuthContextValue {
  user: User;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, error, signIn, register, signOut, clearError } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-xs text-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login/register
  if (!user) {
    return (
      <LoginScreen
        error={error}
        onSignIn={signIn}
        onRegister={register}
        onClearError={clearError}
      />
    );
  }

  // Authenticated — render app
  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

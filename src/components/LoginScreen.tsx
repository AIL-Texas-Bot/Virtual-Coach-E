"use client";

import { useState } from "react";
import Image from "next/image";

interface LoginScreenProps {
  error: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onClearError: () => void;
}

type Mode = "login" | "register";

export default function LoginScreen({ error, onSignIn, onRegister, onClearError }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setLocalError(null);
    onClearError();
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    onClearError();

    if (mode === "register" && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await onSignIn(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch {
      // Error is handled by useAuth and passed via error prop
    } finally {
      setLoading(false);
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo + Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Natural Nutrition Coaching"
              width={90}
              height={107}
              priority
              className="opacity-95"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text tracking-tight">
              Virtual Coach<span className="text-gold">-E</span>
            </h1>
            <p className="text-sm text-text-dim">Natural Nutrition Coaching</p>
          </div>
          <div className="w-12 h-px bg-gold/30 mx-auto" />
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 bg-bg-card rounded-lg p-1">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
              mode === "login" ? "bg-bg-hover text-gold" : "text-text-dim hover:text-text-mid"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
              mode === "register" ? "bg-bg-hover text-gold" : "text-text-dim hover:text-text-mid"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-text-mid block mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ailandy216@gmail.com"
                required
                autoComplete="email"
                className="w-full bg-bg-card px-4 py-3 rounded-lg text-sm text-text placeholder:text-text-dim/40 border border-white/10 focus:border-gold/40 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-medium text-text-mid block mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full bg-bg-card px-4 py-3 rounded-lg text-sm text-text placeholder:text-text-dim/40 border border-white/10 focus:border-gold/40 focus:outline-none"
              />
            </div>
            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="text-xs font-medium text-text-mid block mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full bg-bg-card px-4 py-3 rounded-lg text-sm text-text placeholder:text-text-dim/40 border border-white/10 focus:border-gold/40 focus:outline-none"
                />
              </div>
            )}
          </div>

          {displayError && (
            <p className="text-xs text-danger text-center">{displayError}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || (mode === "register" && !confirmPassword)}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "login" ? "Signing in..." : "Creating account..."
              : mode === "login" ? "Sign In" : "Create Account"
            }
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-xs text-text-dim">12-Week Transformation Protocol</p>
          <p className="text-[10px] text-text-dim/50 italic">
            &ldquo;Master the process — the results are inevitable.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

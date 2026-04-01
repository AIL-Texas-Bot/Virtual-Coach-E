"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Replace with Firebase Auth signInWithEmailAndPassword
      // For now, simulate login
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
            <p className="text-sm text-text-dim">
              Natural Nutrition Coaching
            </p>
          </div>
          <div className="w-12 h-px bg-gold/30 mx-auto" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                autoComplete="current-password"
                className="w-full bg-bg-card px-4 py-3 rounded-lg text-sm text-text placeholder:text-text-dim/40 border border-white/10 focus:border-gold/40 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-danger text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-xs text-text-dim">
            12-Week Transformation Protocol
          </p>
          <p className="text-[10px] text-text-dim/50 italic">
            &ldquo;Master the process — the results are inevitable.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

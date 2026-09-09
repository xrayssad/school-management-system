"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "student" ? "/dashboard" : "/teacher/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <Image src="/images/logo2.jpg" alt="Madrasa logo" width={44} height={44} className="rounded-full object-cover" />
          <span className="font-serif text-lg font-semibold text-teal-900">Al Madrasat Habiib</span>
        </Link>

        <div className="rounded-xl2 border border-teal-100/60 bg-white p-8 shadow-soft">
          <h1 className="font-serif text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-400">Log in to your student or teacher portal.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink-600">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-teal-100 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-ink-600">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-teal-100 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-teal-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? "Logging in\u2026" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-teal-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-xl2 border border-gold-100 bg-gold-50 p-4 text-xs text-gold-700">
          <p className="font-medium">Demo credentials (after seeding the database):</p>
          <p className="mt-1">Teacher: ahmed.ali@madrasa.sc.tz / Teacher@123</p>
          <p>Student: ahmed.mohammed@student.madrasa.sc.tz / Student@123</p>
        </div>
      </div>
    </div>
  );
}

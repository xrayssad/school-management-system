"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { FormEvent, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Nenosiri liwe na herufi 6 au zaidi.");
      return;
    }
    if (password !== confirm) {
      setError("Nenosiri halifanani.");
      return;
    }
    if (!token) {
      setError("Kiungo si sahihi. Omba reset upya.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Imeshindikana kubadilisha nenosiri.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Imeshindikana kuwasiliana na server.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <MadrasaLoader />;
  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-8" style={{ borderColor: colors.line }}>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Nenosiri jipya
      </h1>
      <p className="mt-2 text-sm" style={{ color: colors.stone }}>
        Weka nenosiri jipya la akaunti yako.
      </p>

      {done ? (
        <div className="mt-6 flex items-start gap-2 rounded-lg border px-3 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>Nenosiri limebadilishwa. Unaongozwa kwenye kuingia…</span>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Nenosiri jipya</label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.stone }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none"
                style={{ borderColor: colors.line }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Thibitisha nenosiri</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: colors.line }}
            />
          </div>
          {error && (
            <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#fef2f2", color: "#b91c1c" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? "Inahifadhi…" : "Hifadhi nenosiri"}
          </button>
          <Link href="/login" className="block text-center text-sm" style={{ color: colors.stone }}>
            Rudi kuingia
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: colors.soft }}>
      <Suspense fallback={<p className="text-sm" style={{ color: colors.stone }}>…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}

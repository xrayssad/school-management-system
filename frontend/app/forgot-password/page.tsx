"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setDevLink("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), channel: "email" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Imeshindikana kutuma ombi.");
        return;
      }
      setDone(true);
      if (data.dev_reset_link) setDevLink(data.dev_reset_link);
    } catch {
      setError("Imeshindikana kuwasiliana na server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: colors.soft }}>
      <div className="w-full max-w-md rounded-2xl border bg-white p-8" style={{ borderColor: colors.line }}>
        <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm" style={{ color: colors.stone }}>
          <ArrowLeft size={14} /> Rudi kuingia
        </Link>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Umesahau nenosiri?
        </h1>
        

        {done ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2 rounded-lg border px-3 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>Ikiwa akaunti ipo, angalia barua pepe yako (na spam).</span>
            </div>
            {devLink && (
              <p className="break-all text-xs" style={{ color: colors.stone }}>
                Dev link:{" "}
                <a href={devLink} className="font-medium underline" style={{ color: colors.primary }}>
                  {devLink}
                </a>
              </p>
            )}
            <Link href="/login" className="inline-block text-sm font-semibold" style={{ color: colors.primary }}>
              Rudi kuingia
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>
                Namba ya usajili au email
              </label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.stone }} />
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none"
                  style={{ borderColor: colors.line }}
                  placeholder="Namba ya usajili au email"
                />
              </div>
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
              {loading ? "Inatuma…" : "Tuma kiungo"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

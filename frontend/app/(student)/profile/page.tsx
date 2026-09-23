"use client";

import { FormEvent, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";
import { useAuth } from "@/lib/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type ProfileData = {
  full_name?: string;
  email?: string;
  phone?: string | null;
  student_code?: string;
  class_name?: string;
  promotion_status?: string | null;
  promotion_note?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
};

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("madrasa_token");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);

    async function load() {
      setLoading(true);
      setError("");
      try {
        let body: any = null;
        for (const path of ["/student/my-profile", "/auth/me"]) {
          const res = await fetch(`${API}${path}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctrl.signal,
          });
          if (res.ok) {
            body = await res.json();
            break;
          }
        }
        if (!body) throw new Error("Imeshindikana kupakia wasifu");
        const sp = body.student_profile || body;
        if (!cancelled) {
          setData({
            full_name: body.full_name || user?.full_name,
            email: body.email || user?.email,
            phone: body.phone ?? sp.phone,
            student_code: sp.student_code || body.student_code,
            class_name: sp.class_name || body.class_name,
            promotion_status: sp.promotion_status,
            promotion_note: sp.promotion_note,
            guardian_name: sp.guardian_name,
            guardian_phone: sp.guardian_phone,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setData({
            full_name: user?.full_name,
            email: user?.email,
            phone: (user as any)?.phone,
            student_code: (user as any)?.student_profile?.student_code,
            class_name: (user as any)?.student_profile?.class_name,
          });
          setError(
            e?.name === "AbortError"
              ? "Muda umeisha — taarifa chache zinaonyeshwa."
              : e.message || "Imeshindikana"
          );
        }
      } finally {
        clearTimeout(timer);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [user]);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    setPwBusy(true);
    try {
      const token = localStorage.getItem("madrasa_token");
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwErr(
          typeof body.detail === "string"
            ? body.detail
            : JSON.stringify(body.detail || body) || "Imeshindikana"
        );
        return;
      }
      setPwMsg("Nenosiri limebadilishwa.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwErr(err.message || "Imeshindikana");
    } finally {
      setPwBusy(false);
    }
  }

  if (loading) return <MadrasaLoader label="Inapakia wasifu…" />;

  const fields = [
    { label: "Jina", value: data?.full_name },
    { label: "Namba ya usajili", value: data?.student_code },
    { label: "Darasa", value: data?.class_name },
    { label: "Barua pepe", value: data?.email },
    { label: "Simu", value: data?.phone },
    {
      label: "Mlezi",
      value: [data?.guardian_name, data?.guardian_phone].filter(Boolean).join(" · ") || null,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Wasifu wangu
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Taarifa za akaunti ya mwanafunzi
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
      )}

      {/* Taarifa + nenosiri side by side on md+ */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Details — wider */}
        <div
          className="rounded-xl border bg-white p-5 lg:col-span-3"
          style={{ borderColor: colors.line }}
        >
          <h2 className="mb-4 font-serif text-base font-semibold" style={{ color: colors.primary }}>
            Taarifa binafsi
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border px-3 py-2.5"
                style={{ borderColor: colors.line, backgroundColor: colors.paper }}
              >
                <p className="text-[11px] uppercase tracking-wide" style={{ color: colors.stone }}>
                  {f.label}
                </p>
                <p className="mt-0.5 text-sm font-medium break-all">{f.value || "—"}</p>
              </div>
            ))}
            {data?.promotion_status && data.promotion_status !== "pending" && (
              <div
                className="rounded-lg border px-3 py-2.5 sm:col-span-2"
                style={{ borderColor: colors.line, backgroundColor: colors.soft }}
              >
                <p className="text-[11px] uppercase tracking-wide" style={{ color: colors.stone }}>
                  Hali ya darasa
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {data.promotion_status}
                  {data.promotion_note ? ` — ${data.promotion_note}` : ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Password — narrower column */}
        <div
          className="rounded-xl border bg-white p-5 lg:col-span-2"
          style={{ borderColor: colors.line }}
        >
          <h2 className="mb-4 font-serif text-base font-semibold" style={{ color: colors.primary }}>
            Badilisha nenosiri
          </h2>
          <form onSubmit={changePassword} className="space-y-3">
            <div>
              <label className="text-xs font-medium">Nenosiri la sasa</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.line }}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Nenosiri jipya</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.line }}
              />
            </div>
            {pwMsg && <p className="text-sm" style={{ color: colors.primary }}>{pwMsg}</p>}
            {pwErr && <p className="text-sm text-red-700">{pwErr}</p>}
            <button
              type="submit"
              disabled={pwBusy}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: colors.primary }}
            >
              {pwBusy ? "Inahifadhi…" : "Hifadhi nenosiri"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

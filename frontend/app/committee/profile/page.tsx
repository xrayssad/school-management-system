"use client";

import { FormEvent, useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";
import { useAuth } from "@/lib/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function CommitteeProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("madrasa_token");
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);

    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.detail || "Imeshindikana");
        if (!cancelled) {
          setMe(body);
          setFullName(body.full_name || "");
          setPhone(body.phone || "");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setMe(user);
          setFullName(user?.full_name || "");
          setPhone((user as any)?.phone || "");
          setError(e?.name === "AbortError" ? "Muda umeisha" : e.message);
        }
      })
      .finally(() => {
        clearTimeout(t);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(t);
    };
  }, [user]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaveMsg("");
    setError("");
    setBusy(true);
    try {
      const token = localStorage.getItem("madrasa_token");
      let res = await fetch(`${API}/auth/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ full_name: fullName, phone: phone || null }),
      });
      if (res.status === 405 || res.status === 404) {
        res = await fetch(`${API}/users/me`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ full_name: fullName, phone: phone || null }),
        });
      }
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(typeof b.detail === "string" ? b.detail : "Imeshindikana kuhifadhi");
      }
      setSaveMsg("Taarifa zimehifadhiwa.");
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    setBusy(true);
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
        setPwErr(typeof body.detail === "string" ? body.detail : "Imeshindikana");
        return;
      }
      setPwMsg("Nenosiri limebadilishwa.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwErr(err.message || "Imeshindikana");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <MadrasaLoader label="Inapakia wasifu…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Wasifu wa Kamati
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Taarifa za mwanachama wa uongozi
        </p>
      </div>

      {error && <p className="text-sm text-amber-800">{error}</p>}

      {/* Horizontal: identity | edit | password */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Card 1 — identity */}
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
          <h2 className="mb-3 font-serif text-base font-semibold" style={{ color: colors.primary }}>
            Akaunti
          </h2>
          <div className="space-y-3">
            <div
              className="rounded-lg border px-3 py-2.5"
              style={{ borderColor: colors.line, backgroundColor: colors.paper }}
            >
              <p className="text-[11px] uppercase tracking-wide" style={{ color: colors.stone }}>
                Jukumu
              </p>
              <p className="mt-0.5 text-sm font-medium capitalize">{me?.role || "committee"}</p>
            </div>
            <div
              className="rounded-lg border px-3 py-2.5"
              style={{ borderColor: colors.line, backgroundColor: colors.paper }}
            >
              <p className="text-[11px] uppercase tracking-wide" style={{ color: colors.stone }}>
                Barua pepe
              </p>
              <p className="mt-0.5 break-all text-sm font-medium">{me?.email || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Card 2 — edit profile */}
        <form
          onSubmit={saveProfile}
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: colors.line }}
        >
          <h2 className="mb-3 font-serif text-base font-semibold" style={{ color: colors.primary }}>
            Hariri taarifa
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Jina kamili</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.line }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium">Simu</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.line }}
                placeholder="+255…"
              />
            </div>
            {saveMsg && <p className="text-sm" style={{ color: colors.primary }}>{saveMsg}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              Hifadhi
            </button>
          </div>
        </form>

        {/* Card 3 — password */}
        <form
          onSubmit={changePassword}
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: colors.line }}
        >
          <h2 className="mb-3 font-serif text-base font-semibold" style={{ color: colors.primary }}>
            Badilisha nenosiri
          </h2>
          <div className="space-y-3">
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
              disabled={busy}
              className="w-full rounded-lg border px-4 py-2.5 text-sm font-semibold"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              Badilisha nenosiri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

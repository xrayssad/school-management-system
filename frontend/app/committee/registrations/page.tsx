"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { allClasses, CLASS_ORDER } from "@/lib/classes";

import { FormEvent, useEffect, useState } from "react";
import { UserPlus, CheckCircle, XCircle, Upload, RefreshCw } from "lucide-react";
import {
  registrationApi,
  type RegistrationRequest,
} from "@/lib/committee-registrations";
import { colors } from "@/lib/colors";

export default function CommitteeRegistrationsPage() {
  const [items, setItems] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "">("pending");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [csvResult, setCsvResult] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await registrationApi.list(filter || undefined);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana kupakia.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function approve(id: string) {
    const code = (codes[id] || "").trim().toUpperCase();
    if (code.length < 3) {
      setError("Weka namba ya usajili (angalau herufi 3).");
      return;
    }
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await registrationApi.approve(id, code);
      setSuccess("Ombi limeidhinishwa. Mwanafunzi anaweza kuingia sasa.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana kuidhinisha.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await registrationApi.reject(id, "Imekataliwa na Kamati");
      setSuccess("Ombi limekataliwa.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Imeshindikana kukataa.");
    } finally {
      setBusyId(null);
    }
  }

  async function onCsv(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("csv") as HTMLInputElement);
    const file = input.files?.[0];
    if (!file) {
      setError("Chagua faili ya CSV.");
      return;
    }
    setError("");
    setCsvResult("");
    try {
      const res = await registrationApi.importCsv(file);
      setCsvResult(
        `Imeundwa: ${res.created}, Rukwa: ${res.skipped}` +
          (res.errors.length ? ` · Makosa: ${res.errors.slice(0, 3).join("; ")}` : "")
      );
      input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload imeshindikana.");
    }
  }

  if (loading) return <MadrasaLoader />;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
            Maombi ya usajili
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>
            Idhinisha, kutoa namba ya usajili, au pakia CSV
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: colors.line, color: colors.primary }}
        >
          <RefreshCw size={14} /> Sasisha
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>
          {success}
        </div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
        <div className="mb-3 flex items-center gap-2">
          <Upload size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Pakia CSV ya wanafunzi</h2>
        </div>
        <p className="mb-3 text-xs" style={{ color: colors.stone }}>
          Vichwa: full_name, email, phone, class_name, student_code, password, guardian_name, guardian_phone.
          Password tupu = Student@123. student_code tupu = otomatiki.
        </p>
        <form onSubmit={onCsv} className="flex flex-wrap items-center gap-3">
          <input name="csv" type="file" accept=".csv" className="text-sm" />
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            Pakia
          </button>
        </form>
        {csvResult && <p className="mt-2 text-sm" style={{ color: colors.primary }}>{csvResult}</p>}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", ""] as const).map((f) => (
          <button
            key={f || "all"}
            type="button"
            onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: filter === f ? colors.primary : colors.soft,
              color: filter === f ? "#fff" : colors.primary,
            }}
          >
            {f === "pending" ? "Pending" : f === "approved" ? "Approved" : f === "rejected" ? "Rejected" : "Zote"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: colors.line }}>
          <UserPlus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>
            Orodha ({items.length})
          </h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>…</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna maombi.</p>
        ) : (
          <ul>
            {items.map((r) => (
              <li key={r.id} className="border-b px-5 py-4 last:border-0" style={{ borderColor: colors.line }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      {r.photo_url ? (
                        <img
                          src={r.photo_url.startsWith("http") ? r.photo_url : `http://localhost:8000${r.photo_url}`}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                          {r.full_name.slice(0, 1)}
                        </div>
                      )}
                      <p className="text-sm font-medium" style={{ color: colors.ink }}>{r.full_name}</p>
                    </div>
                    <p className="text-xs" style={{ color: colors.stone }}>
                      {r.email} · {r.class_name}
                      {r.phone ? ` · ${r.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: colors.stone }}>
                      {new Date(r.created_at).toLocaleString("sw-TZ")} · {r.status}
                      {r.student_code ? ` · ${r.student_code}` : ""}
                    </p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        placeholder="STU90001"
                        value={codes[r.id] || ""}
                        onChange={(e) => setCodes((c) => ({ ...c, [r.id]: e.target.value }))}
                        className="w-28 rounded-lg border px-2 py-1.5 text-sm"
                        style={{ borderColor: colors.line }}
                      />
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => approve(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <CheckCircle size={12} /> Idhinisha
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => reject(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                        style={{ borderColor: colors.line, color: "#b91c1c" }}
                      >
                        <XCircle size={12} /> Kataa
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

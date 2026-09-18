"use client";

import { allClasses, CLASS_ORDER } from "@/lib/classes";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

export default function CommitteePromotionPage() {
  const [term, setTerm] = useState("Muhula 2");
  const [preview, setPreview] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadPreview() {
    setLoading(true);
    setError("");
    try {
      const d = await api.get<any>(`/committee/promotion/preview?term=${encodeURIComponent(term)}`);
      setPreview(d);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreview();
  }, []);

  async function apply() {
    setMsg("");
    setError("");
    try {
      const d = await api.post<any>("/committee/promotion/apply", { term, published_only: true });
      setPreview(d);
      setMsg(
        `Imewekwa: ${d.summary?.repeated ?? 0} kurudishwa, ${d.summary?.promoted ?? 0} kupandishwa`
      );
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  const items = preview?.items || [];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Kupandishwa / Kurudishwa
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Muhula wa pili: wastani D au chini → anarudishwa darasa. Matokeo yaliyochapishwa tu.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs font-semibold" style={{ color: colors.primary }}>Muhula</label>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="mt-1 block rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          />
        </div>
        <button
          type="button"
          onClick={loadPreview}
          className="rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          Angalia
        </button>
        <button
          type="button"
          onClick={apply}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Thibitisha na weka status
        </button>
      </div>

      {msg && <p className="mt-3 text-sm" style={{ color: colors.primary }}>{msg}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-3 text-sm" style={{ color: colors.stone }}>Inahisabu…</p>}

      {preview?.summary && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg border px-3 py-1" style={{ borderColor: colors.line }}>
            Jumla: {preview.summary.total}
          </span>
          <span className="rounded-lg border px-3 py-1 text-red-800" style={{ borderColor: colors.line }}>
            Kurudishwa: {preview.summary.repeated}
          </span>
          <span className="rounded-lg border px-3 py-1" style={{ borderColor: colors.line, color: colors.primary }}>
            Kupandishwa: {preview.summary.promoted}
          </span>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Mwanafunzi</th>
              <th>Namba</th>
              <th>Darasa</th>
              <th>Wastani</th>
              <th>Grade</th>
              <th>Hali</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it.profile_id} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2">{it.full_name}</td>
                <td>{it.student_code}</td>
                <td>{it.class_name}</td>
                <td>{it.average}%</td>
                <td>{it.average_letter}</td>
                <td>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: it.status === "repeated" ? "#FEE2E2" : "#E4EFE9",
                      color: it.status === "repeated" ? "#991B1B" : colors.primary,
                    }}
                  >
                    {it.status === "repeated" ? "Kurudishwa" : "Kupandishwa"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && !loading && (
          <p className="p-4 text-xs" style={{ color: colors.stone }}>
            Hakuna matokeo yaliyochapishwa. Chapisha grades kwanza kisha rudi hapa.
          </p>
        )}
      </div>
    </div>
  );
}

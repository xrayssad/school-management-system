"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";

type Scale = {
  class_name: string;
  min_a: number;
  min_b: number;
  min_c: number;
  min_d: number;
  min_promote_average: number;
  fail_letter?: string;
};

export default function CommitteeGradesPage() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<Scale>({
    class_name: "Maandalizi",
    min_a: 75,
    min_b: 65,
    min_c: 50,
    min_d: 40,
    min_promote_average: 38,
  });

  async function load() {
    try {
      const [s, p] = await Promise.all([
        api.get<Scale[]>("/committee/grades/scales").catch(() => []),
        api.get<any[]>("/committee/grades/pending").catch(() => []),
      ]);
      setScales(Array.isArray(s) ? s : []);
      setPending(Array.isArray(p) ? p : []);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveScale(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.put("/committee/grades/scales", form);
      setMsg(`Scale ya ${form.class_name} imehifadhiwa (kubaki chini ya ${form.min_promote_average}%)`);
      await load();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    }
  }

  async function publishAll() {
    setMsg("");
    try {
      const r = await api.post<any>("/committee/grades/publish-all-submitted", {});
      setMsg(
        `Imechapishwa: ${r.published ?? 0}. Promotion: ${JSON.stringify(r.promotion || {})}`
      );
      await load();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    }
  }

  function pickScale(cn: string) {
    const s = scales.find((x) => x.class_name === cn);
    setForm({
      class_name: cn,
      min_a: s?.min_a ?? 75,
      min_b: s?.min_b ?? 65,
      min_c: s?.min_c ?? 50,
      min_d: s?.min_d ?? 40,
      min_promote_average: s?.min_promote_average ?? 40,
    });
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Matokeo na viwango vya darasa
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Weka wastani wa chini wa kupandishwa kwa kila darasa (Maandalizi → la 5). Chini ya hiyo = anabaki.
      </p>

      {msg && <p className="mt-3 text-sm" style={{ color: colors.primary }}>{msg}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={saveScale} className="mt-4 rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: colors.line }}>
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>Scale kwa darasa</p>
        <div>
          <label className="text-xs font-medium">Darasa</label>
          <select
            value={form.class_name}
            onChange={(e) => pickScale(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          >
            {allClasses().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(
            [
              ["min_a", "Min A"],
              ["min_b", "Min B"],
              ["min_c", "Min C"],
              ["min_d", "Min D"],
              ["min_promote_average", "Wastani kupandishwa"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-medium">{label}</label>
              <input
                type="number"
                step="0.1"
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: colors.line }}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: colors.primary }}>
          Hifadhi scale
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Darasa</th>
              <th>A</th><th>B</th><th>C</th><th>D</th>
              <th>Wastani (kubaki chini yake)</th>
            </tr>
          </thead>
          <tbody>
            {allClasses().map((cn) => {
              const s = scales.find((x) => x.class_name === cn);
              return (
                <tr key={cn} className="border-t cursor-pointer" style={{ borderColor: colors.line }} onClick={() => pickScale(cn)}>
                  <td className="px-3 py-2 font-medium">{cn}</td>
                  <td>{s?.min_a ?? "—"}</td>
                  <td>{s?.min_b ?? "—"}</td>
                  <td>{s?.min_c ?? "—"}</td>
                  <td>{s?.min_d ?? "—"}</td>
                  <td>{s?.min_promote_average ?? "—"}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>Zilizowasilishwa</h2>
          <button type="button" onClick={publishAll} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            Chapisha zote + pandisha/rudisha
          </button>
        </div>
        <p className="mt-1 text-xs" style={{ color: colors.stone }}>Jumla pending: {pending.length}</p>
      </div>
    </div>
  );
}

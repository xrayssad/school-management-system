"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import { allClasses } from "@/lib/classes";
import MadrasaLoader from "@/components/MadrasaLoader";

const MONTHS = [
  "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni",
  "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba",
];

function money(n: number) {
  return `TSh ${Number(n || 0).toLocaleString("sw-TZ")}`;
}

export default function CommitteeFeesPage() {
  const now = new Date();
  const [className, setClassName] = useState("Darasa la 1");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [amount, setAmount] = useState("50000");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await api.get<any>(
        `/committee/fees/students?class_name=${encodeURIComponent(className)}&year=${year}&month=${month}`
      );
      setStudents(d.students || []);
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [className, year, month]);

  async function setClassAmount(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/committee/fees/set-amount", {
        class_name: className,
        year,
        month,
        amount: parseFloat(amount) || 0,
      });
      setMsg(`Kiasi ${money(parseFloat(amount))} kimewekwa kwa ${className} — ${MONTHS[month - 1]} ${year}`);
      await load();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    }
  }

  async function mark(studentId: string, status: string, amountPaid?: number) {
    setMsg("");
    try {
      await api.post("/committee/fees/mark-paid", {
        student_id: studentId,
        year,
        month,
        status,
        amount_paid: amountPaid,
      });
      setMsg("Status imesasishwa — mwanafunzi anaona kwenye Ada yake");
      await load();
    } catch (err: any) {
      setError(err.message || "Imeshindikana");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Ada
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Chagua darasa na mwezi · weka kiasi · idhinisha malipo · mwanafunzi anaona status
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          {allClasses().map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
          className="w-24 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        />
      </div>

      <form onSubmit={setClassAmount} className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs font-semibold">Kiasi cha mwezi (darasa lote)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-40 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: colors.line }}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Weka kiasi kwa darasa
        </button>
      </form>

      {msg && <p className="mt-2 text-sm" style={{ color: colors.primary }}>{msg}</p>}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <MadrasaLoader label="Inapakia wanafunzi…" />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border bg-white" style={{ borderColor: colors.line }}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs" style={{ color: colors.stone }}>
                <th className="px-3 py-2">Namba</th>
                <th>Jina</th>
                <th>Kiasi</th>
                <th>Amelipa</th>
                <th>Hali</th>
                <th>Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id} className="border-t" style={{ borderColor: colors.line }}>
                  <td className="px-3 py-2">{s.student_code}</td>
                  <td className="font-medium">{s.full_name}</td>
                  <td>{money(s.amount)}</td>
                  <td>{money(s.amount_paid)}</td>
                  <td>
                    <span className="text-xs font-medium">
                      {s.status === "paid"
                        ? "Amelipa"
                        : s.status === "partial"
                          ? "Sehemu"
                          : s.status === "waived"
                            ? "Msamaha"
                            : "Hajalipa"}
                    </span>
                  </td>
                  <td className="space-x-1 py-2">
                    <button
                      type="button"
                      onClick={() => mark(s.student_id, "paid", s.amount || parseFloat(amount) || 0)}
                      className="rounded px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Idhinisha
                    </button>
                    <button
                      type="button"
                      onClick={() => mark(s.student_id, "unpaid", 0)}
                      className="rounded border px-2 py-1 text-xs"
                      style={{ borderColor: colors.line }}
                    >
                      Hajalipa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!students.length && (
            <p className="p-4 text-sm" style={{ color: colors.stone }}>
              Hakuna wanafunzi katika darasa hili.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import MadrasaLoader from "@/components/MadrasaLoader";

type MonthRow = {
  month: number;
  month_name: string;
  amount: number;
  amount_paid: number;
  status: string;
  paid_at?: string | null;
  note?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Amelipa",
  partial: "Sehemu",
  unpaid: "Hajalipa",
  waived: "Msamaha",
};

const STATUS_COLOR: Record<string, string> = {
  paid: "#166534",
  partial: "#A16207",
  unpaid: "#991B1B",
  waived: "#1E3A5F",
};

function money(n: number) {
  return `TSh ${Number(n || 0).toLocaleString("sw-TZ")}`;
}

export default function StudentFeesPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([year]);
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [meta, setMeta] = useState({ student_code: "", class_name: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get<any>(`/student/my-fees?year=${year}`)
      .then((d) => {
        setMonths(d.months || []);
        setSummary(d.summary || null);
        setYears(d.years?.length ? d.years : [year]);
        setMeta({
          student_code: d.student_code || "",
          class_name: d.class_name || "",
        });
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <MadrasaLoader label="Inapakia ada…" />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Ada
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        {[meta.student_code, meta.class_name].filter(Boolean).join(" · ")} · status kutoka Kamati
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold">Mwaka</label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: colors.line }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
          {/* ensure current selectable */}
          {!years.includes(new Date().getFullYear()) && (
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
          )}
        </select>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {summary && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Inayotakiwa", money(summary.total_due)],
            ["Amelipa", money(summary.total_paid)],
            ["Salio", money(summary.balance)],
            ["Miezi", `${summary.months_paid}/${summary.months_total}`],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl border bg-white px-3 py-3"
              style={{ borderColor: colors.line }}
            >
              <p className="text-[11px]" style={{ color: colors.stone }}>
                {k}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: colors.primary }}>
                {v}
              </p>
            </div>
          ))}
        </div>
      )}

      <div
        className="mt-4 overflow-x-auto rounded-xl border bg-white"
        style={{ borderColor: colors.line }}
      >
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-xs" style={{ color: colors.stone }}>
              <th className="px-3 py-2">Mwezi</th>
              <th>Kiasi</th>
              <th>Amelipa</th>
              <th>Hali</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-t" style={{ borderColor: colors.line }}>
                <td className="px-3 py-2.5 font-medium">
                  {m.month_name}
                  <span className="ml-1 text-xs font-normal" style={{ color: colors.stone }}>
                    {year}
                  </span>
                </td>
                <td>{money(m.amount)}</td>
                <td>{money(m.amount_paid)}</td>
                <td>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      color: STATUS_COLOR[m.status] || colors.ink,
                      backgroundColor: "rgba(0,0,0,0.04)",
                    }}
                  >
                    {STATUS_LABEL[m.status] || m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

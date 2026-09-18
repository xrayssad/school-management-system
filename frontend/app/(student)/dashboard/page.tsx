"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import { useAuth } from "@/lib/auth-context";
import MadrasaLoader from "@/components/MadrasaLoader";

type Teacher = { full_name?: string; subjects?: string[] };
type Subject = { subject_name?: string; teacher_name?: string };
type Entry = {
  day_label?: string;
  day_of_week?: string | number;
  start_time?: string;
  end_time?: string;
  subject_name?: string;
  teacher_name?: string;
};
type MonthFee = {
  month: number;
  month_name: string;
  amount: number;
  amount_paid: number;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Amelipa",
  partial: "Sehemu",
  unpaid: "Hajalipa",
  waived: "Msamaha",
};

function money(n: number) {
  return `TSh ${Number(n || 0).toLocaleString("sw-TZ")}`;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [fees, setFees] = useState<MonthFee[]>([]);
  const [feeYear, setFeeYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const year = new Date().getFullYear();
    Promise.all([
      api.get<any>("/student/my-subjects"),
      api.get<any>("/student/my-teachers"),
      api.get<any>("/student/my-timetable"),
      api.get<any>(`/student/my-fees?year=${year}`),
    ])
      .then(([sub, teach, tt, fee]) => {
        setClassName(sub.class_name || teach.class_name || tt.class_name || fee.class_name || "");
        setSubjects(sub.subjects || []);
        setTeachers(teach.teachers || []);
        setEntries(tt.entries || []);
        setFeeYear(fee.year || year);
        // recent: paid/partial first, then by month desc — show last 4 with activity or current month window
        const months: MonthFee[] = fee.months || [];
        const recent = [...months]
          .filter((m) => m.status === "paid" || m.status === "partial" || m.amount_paid > 0)
          .reverse()
          .slice(0, 4);
        setFees(recent.length ? recent : months.filter((m) => m.month <= new Date().getMonth() + 1).slice(-3));
      })
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader label="Inapakia dashibodi…" />;

  const firstName = user?.full_name?.split(" ")[0] || "Mwanafunzi";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Assalamu alaikum, {firstName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          {className ? `Darasa: ${className}` : "Dashibodi yako"} · masomo, walimu, ratiba na ada
        </p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Masomo + Walimu */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
              Masomo
            </h2>
            <Link href="/subjects" className="text-xs font-medium underline" style={{ color: colors.primary }}>
              Yote
            </Link>
          </div>
          <ul className="space-y-2">
            {subjects.slice(0, 8).map((s, i) => (
              <li key={s.subject_name || i} className="text-sm">
                <span className="font-medium">{s.subject_name}</span>
                {s.teacher_name && (
                  <span className="text-xs" style={{ color: colors.stone }}>
                    {" "}
                    · {s.teacher_name}
                  </span>
                )}
              </li>
            ))}
            {!subjects.length && (
              <li className="text-sm" style={{ color: colors.stone }}>
                Hakuna masomo kwenye ratiba ya darasa lako.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
              Walimu
            </h2>
            <Link href="/teachers" className="text-xs font-medium underline" style={{ color: colors.primary }}>
              Wote
            </Link>
          </div>
          <ul className="space-y-2">
            {teachers.slice(0, 8).map((t, i) => (
              <li key={t.full_name || i} className="text-sm">
                <span className="font-medium">{t.full_name}</span>
                {(t.subjects || []).length > 0 && (
                  <span className="text-xs" style={{ color: colors.stone }}>
                    {" "}
                    · {(t.subjects || []).join(", ")}
                  </span>
                )}
              </li>
            ))}
            {!teachers.length && (
              <li className="text-sm" style={{ color: colors.stone }}>
                Hakuna walimu waliopewa darasa lako.
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Ratiba vipindi */}
      <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
            Ratiba ya vipindi
          </h2>
          <Link href="/timetable" className="text-xs font-medium underline" style={{ color: colors.primary }}>
            Kamili
          </Link>
        </div>
        {entries.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-xs" style={{ color: colors.stone }}>
                  <th className="py-1 pr-3">Siku</th>
                  <th className="pr-3">Muda</th>
                  <th className="pr-3">Somo</th>
                  <th>Mwalimu</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 12).map((e, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="py-2 pr-3">{e.day_label || String(e.day_of_week || "—")}</td>
                    <td className="pr-3" style={{ color: colors.stone }}>
                      {[e.start_time, e.end_time].filter(Boolean).join(" – ") || "—"}
                    </td>
                    <td className="pr-3 font-medium">{e.subject_name || "—"}</td>
                    <td style={{ color: colors.stone }}>{e.teacher_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna vipindi vilivyochapishwa kwa darasa lako.
          </p>
        )}
      </section>

      {/* Recent malipo */}
      <section className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold" style={{ color: colors.primary }}>
            Malipo ya hivi karibuni
          </h2>
          <Link href="/fees" className="text-xs font-medium underline" style={{ color: colors.primary }}>
            Ada yote ({feeYear})
          </Link>
        </div>
        {fees.length ? (
          <ul className="space-y-2">
            {fees.map((f) => (
              <li
                key={f.month}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span>
                  {f.month_name} {feeYear}
                  <span className="ml-2 text-xs" style={{ color: colors.stone }}>
                    {money(f.amount_paid)} / {money(f.amount)}
                  </span>
                </span>
                <span className="text-xs font-medium">
                  {STATUS_LABEL[f.status] || f.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna rekodi za ada bado.
          </p>
        )}
      </section>
    </div>
  );
}

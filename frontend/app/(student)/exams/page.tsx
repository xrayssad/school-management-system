"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api } from "@/lib/api";
import type { Grade } from "@/lib/types";
import { colors } from "@/lib/colors";

function gradeTone(letter: string): "teal" | "gold" | "red" {
  if (["A+", "A", "A-"].includes(letter)) return "teal";
  if (["B+", "B", "B-", "C"].includes(letter)) return "gold";
  return "red";
}

export default function ExamsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Grade[]>("/grades/me").then(setGrades).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Mitihani na alama" subtitle="Matokeo yako katika masomo yote" />
      {grades.length === 0 ? (
        <EmptyState title="Hakuna alama bado" description="Matokeo yataonekana baada ya mwalimu kuweka alama." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: colors.line }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: colors.soft }}>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ color: colors.stone }}>
                  <th className="px-4 py-3">Mtihani</th>
                  <th className="px-4 py-3">Somo</th>
                  <th className="px-4 py-3">Tarehe</th>
                  <th className="px-4 py-3">Alama</th>
                  <th className="px-4 py-3">Daraja</th>
                  <th className="px-4 py-3">Maelezo</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id} className="border-t" style={{ borderColor: colors.line }}>
                    <td className="px-4 py-3 font-medium" style={{ color: colors.ink }}>{g.exam?.title ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{g.exam?.subject?.name ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{g.exam ? new Date(g.exam.exam_date).toLocaleDateString("sw-TZ") : "—"}</td>
                    <td className="px-4 py-3" style={{ color: colors.ink }}>{g.marks_obtained} / {g.exam?.total_marks ?? "?"}</td>
                    <td className="px-4 py-3"><Badge tone={gradeTone(g.grade_letter)}>{g.grade_letter}</Badge></td>
                    <td className="px-4 py-3" style={{ color: colors.stone }}>{g.remarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api } from "@/lib/api";
import type { Grade } from "@/lib/types";

function gradeTone(letter: string): "teal" | "gold" | "red" {
  if (["A+", "A", "A-"].includes(letter)) return "teal";
  if (["B+", "B", "B-", "C"].includes(letter)) return "gold";
  return "red";
}

export default function ExamsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Grade[]>("/grades/me")
      .then(setGrades)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Exams & grades" subtitle="Your exam results across all subjects" />
      {grades.length === 0 ? (
        <EmptyState title="No grades yet" description="Your results will appear here once your teacher grades an exam." />
      ) : (
        <div className="overflow-hidden rounded-xl2 border border-teal-100/60 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sage/60 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3">Exam</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-t border-sage">
                  <td className="px-5 py-3 font-medium text-ink">{g.exam?.title ?? "\u2014"}</td>
                  <td className="px-5 py-3 text-ink-600">{g.exam?.subject?.name ?? "\u2014"}</td>
                  <td className="px-5 py-3 text-ink-400">{g.exam ? new Date(g.exam.exam_date).toLocaleDateString() : "\u2014"}</td>
                  <td className="px-5 py-3 text-ink-600">
                    {g.marks_obtained} / {g.exam?.total_marks ?? "?"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={gradeTone(g.grade_letter)}>{g.grade_letter}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-400">{g.remarks ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

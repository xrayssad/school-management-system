"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { TeacherAnalytics } from "@/lib/types";

export default function ReportsPage() {
  const [data, setData] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<TeacherAnalytics>("/dashboard/teacher/analytics")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const attendanceRows = Object.entries(data.attendance_by_class);
  const subjectRows = Object.entries(data.subject_averages);
  const gradeRows = Object.entries(data.grade_distribution).sort((a, b) => b[1] - a[1]);

  function printReport() {
    window.print();
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Class performance and attendance summaries"
        action={
          <button onClick={printReport} className="rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 print:hidden">
            Print / Save as PDF
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Attendance by class</h2>
          {attendanceRows.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No attendance data recorded yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {attendanceRows.map(([cls, pct]) => (
                  <tr key={cls} className="border-b border-sage last:border-0">
                    <td className="py-2 text-ink-600">{cls}</td>
                    <td className="py-2 text-right font-medium text-ink">{pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Subject averages</h2>
          {subjectRows.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No graded exams yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {subjectRows.map(([subj, avg]) => (
                  <tr key={subj} className="border-b border-sage last:border-0">
                    <td className="py-2 text-ink-600">{subj}</td>
                    <td className="py-2 text-right font-medium text-ink">{avg}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-serif text-lg font-semibold text-ink">Grade distribution</h2>
          {gradeRows.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No grades recorded yet.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-3">
              {gradeRows.map(([letter, count]) => (
                <div key={letter} className="rounded-lg bg-sage px-4 py-3 text-center">
                  <p className="font-serif text-xl font-semibold text-teal-800">{letter}</p>
                  <p className="text-xs text-ink-400">{count} student{count === 1 ? "" : "s"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

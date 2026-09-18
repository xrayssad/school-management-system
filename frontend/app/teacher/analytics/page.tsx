"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { TeacherAnalytics } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const GRADE_COLORS: Record<string, string> = {
  "A+": "#0B4F45", A: "#0F5F53", "A-": "#2E7D32",
  "B+": "#B8862F", B: "#C89A3E", "B-": "#D4AF6A",
  C: "#ED6C02", D: "#D32F2F", F: "#8B0000",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<TeacherAnalytics>("/dashboard/teacher/analytics")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader />;
  if (!data) return null;

  const attendanceData = Object.entries(data.attendance_by_class).map(([name, value]) => ({ name, value }));
  const subjectData = Object.entries(data.subject_averages).map(([name, value]) => ({ name, value }));
  const gradeData = Object.entries(data.grade_distribution).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Visual insight into your classes' performance" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Attendance rate by class</h2>
          {attendanceData.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No data yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7EFE9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="value" fill="#0B4F45" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Average score by subject</h2>
          {subjectData.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No graded exams yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7EFE9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="value" fill="#B8862F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-serif text-lg font-semibold text-ink">Grade distribution</h2>
          {gradeData.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No grades recorded yet.</p>
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {gradeData.map((entry) => (
                      <Cell key={entry.name} fill={GRADE_COLORS[entry.name] ?? "#66716B"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

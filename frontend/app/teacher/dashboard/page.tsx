"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { TeacherDashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<TeacherDashboard>("/dashboard/teacher")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        title={`Assalamu alaikum, ${user?.full_name?.split(" ")[0] ?? "there"}`}
        subtitle={data.role === "admin" ? "School-wide overview" : `Teaching ${data.classes?.length ?? 0} classes`}
      />

      {data.role === "admin" ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total students" value={data.total_students ?? 0} accent="#0B4F45" />
          <StatCard label="Total teachers" value={data.total_teachers ?? 0} accent="#B8862F" />
          <StatCard label="Classes" value={data.total_classes ?? 0} accent="#1976D2" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Students" value={data.student_count ?? 0} accent="#0B4F45" />
            <StatCard label="Assignments set" value={data.assignment_count ?? 0} accent="#1976D2" />
            <StatCard label="Exams recorded" value={data.exam_count ?? 0} accent="#B8862F" />
            <StatCard label="Pending grading" value={data.pending_grading ?? 0} accent="#D32F2F" />
          </div>
          {data.classes && data.classes.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {data.classes.map((c) => (
                <span key={c} className="rounded-full bg-sage px-3 py-1 text-xs font-medium text-teal-800">
                  {c}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

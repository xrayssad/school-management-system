"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { AttendanceSummary } from "@/lib/types";

export default function AttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AttendanceSummary>("/attendance/me/summary")
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!summary) return null;

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Your attendance record for this term" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Overall" value={`${summary.percentage}%`} accent="#0B4F45" />
        <StatCard label="Present" value={summary.present} accent="#0F5F53" />
        <StatCard label="Late" value={summary.late} accent="#B8862F" />
        <StatCard label="Absent" value={summary.absent} accent="#D32F2F" />
        <StatCard label="Excused" value={summary.excused} accent="#3A443F" />
      </div>
      <p className="mt-6 text-sm text-ink-400">Based on {summary.total_days} recorded school days.</p>
    </div>
  );
}

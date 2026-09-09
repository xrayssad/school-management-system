"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { StudentDashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<StudentDashboard>("/dashboard/student")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState title="Couldn't load your dashboard" description="Please try refreshing the page." />;

  return (
    <div>
      <PageHeader
        title={`Assalamu alaikum, ${user?.full_name?.split(" ")[0] ?? "there"}`}
        subtitle={`${data.student.class_name} \u00b7 ${data.student.student_code}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Average score" value={`${data.average_percentage}%`} accent="#0B4F45" />
        <StatCard label="Attendance" value={`${data.attendance_percentage}%`} accent="#B8862F" />
        <StatCard label="Subjects graded" value={data.total_subjects_graded} accent="#1976D2" />
        <StatCard label="Pending assignments" value={data.pending_assignments} accent="#D32F2F" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Recent announcements</h2>
          <div className="mt-4 space-y-4">
            {data.recent_announcements.length === 0 && <p className="text-sm text-ink-400">No announcements yet.</p>}
            {data.recent_announcements.map((a) => (
              <div key={a.id} className="border-b border-sage pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-ink">{a.title}</p>
                <p className="mt-0.5 text-sm text-ink-400">{a.message}</p>
              </div>
            ))}
          </div>
          <Link href="/announcements" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">
            View all announcements &rarr;
          </Link>
        </Card>

        <Card>
          <h2 className="font-serif text-lg font-semibold text-ink">Upcoming events</h2>
          <div className="mt-4 space-y-4">
            {data.upcoming_events.length === 0 && <p className="text-sm text-ink-400">No upcoming events.</p>}
            {data.upcoming_events.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-sage pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-ink">{e.title}</p>
                <p className="text-xs text-ink-400">{new Date(e.event_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <Link href="/events" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">
            View all events &rarr;
          </Link>
        </Card>
      </div>
    </div>
  );
}

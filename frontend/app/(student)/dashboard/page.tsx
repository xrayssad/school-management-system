"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  UserCheck,
  BookOpen,
  ClipboardList,
  Megaphone,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { StudentDashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

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
  if (!data)
    return (
      <EmptyState title="Dashibodi haikupaki" description="Jaribu kuonyesha upya ukurasa." />
    );

  const first = user?.full_name?.split(" ")[0] ?? "Mwanafunzi";
  const stats = [
    { label: "Wastani", value: `${data.average_percentage}%`, icon: TrendingUp },
    { label: "Mahudhurio", value: `${data.attendance_percentage}%`, icon: UserCheck },
    { label: "Masomo yaliyopimwa", value: data.total_subjects_graded, icon: BookOpen },
    { label: "Kazi zinazosubiri", value: data.pending_assignments, icon: ClipboardList },
  ];

  return (
    <div>
      <PageHeader
        title={`Assalamu alaikum, ${first}`}
        subtitle={`${data.student.class_name} · ${data.student.student_code}`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                <Icon size={16} strokeWidth={1.75} />
                <span className="text-xs" style={{ color: colors.stone }}>{s.label}</span>
              </div>
              <p className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
          <div className="mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
            <Megaphone size={18} />
            <h2 className="font-serif text-lg font-semibold">Matangazo ya hivi karibuni</h2>
          </div>
          <div className="space-y-3">
            {data.recent_announcements.length === 0 && (
              <p className="text-sm" style={{ color: colors.stone }}>Hakuna matangazo bado.</p>
            )}
            {data.recent_announcements.map((a) => (
              <div key={a.id} className="border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: colors.line }}>
                <p className="text-sm font-medium" style={{ color: colors.ink }}>{a.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: colors.stone }}>{a.message}</p>
              </div>
            ))}
          </div>
          <Link href="/announcements" className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: colors.primary }}>
            Ona yote <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-5" style={{ borderColor: colors.line }}>
          <div className="mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
            <CalendarDays size={18} />
            <h2 className="font-serif text-lg font-semibold">Matukio yanayokuja</h2>
          </div>
          <div className="space-y-3">
            {data.upcoming_events.length === 0 && (
              <p className="text-sm" style={{ color: colors.stone }}>Hakuna matukio.</p>
            )}
            {data.upcoming_events.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b pb-3 last:border-0" style={{ borderColor: colors.line }}>
                <p className="text-sm font-medium" style={{ color: colors.ink }}>{e.title}</p>
                <p className="text-xs" style={{ color: colors.stone }}>{new Date(e.event_date).toLocaleDateString("sw-TZ")}</p>
              </div>
            ))}
          </div>
          <Link href="/events" className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: colors.primary }}>
            Ona yote <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

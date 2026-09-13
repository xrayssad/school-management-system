"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  GraduationCap,
  AlertCircle,
  CalendarDays,
  Megaphone,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner } from "@/components/Card";
import { api } from "@/lib/api";
import type { TeacherDashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";

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

  const isAdmin = data.role === "admin";
  const firstName = user?.full_name?.split(" ")[0] ?? "Mwalimu";

  const stats = isAdmin
    ? [
        { label: "Wanafunzi", value: data.total_students ?? 0, icon: Users },
        { label: "Walimu", value: data.total_teachers ?? 0, icon: BookOpen },
        { label: "Madarasa", value: data.total_classes ?? 0, icon: GraduationCap },
      ]
    : [
        { label: "Wanafunzi", value: data.student_count ?? 0, icon: Users },
        { label: "Kazi zilizowekwa", value: data.assignment_count ?? 0, icon: ClipboardList },
        { label: "Mitihani", value: data.exam_count ?? 0, icon: GraduationCap },
        { label: "Zinazosubiri alama", value: data.pending_grading ?? 0, icon: AlertCircle },
      ];

  const quick = [
    { href: "/teacher/attendance", label: "Mahudhurio", desc: "Weka mahudhurio ya leo", icon: Users },
    { href: "/teacher/exams", label: "Mitihani", desc: "Unda au weka alama", icon: GraduationCap },
    { href: "/teacher/schedule", label: "Ratiba", desc: "Angalia vipindi", icon: CalendarDays },
    { href: "/teacher/announcements", label: "Matangazo", desc: "Tangaza kwa darasa", icon: Megaphone },
  ];

  return (
    <div>
      <PageHeader
        title={`Assalamu alaikum, ${firstName}`}
        subtitle={
          isAdmin
            ? "Muhtasari wa shule nzima"
            : `Unafundisha madarasa ${data.classes?.length ?? 0}`
        }
      />

      <div className={`grid gap-3 ${isAdmin ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: colors.line }}
            >
              <div className="mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                <Icon size={18} strokeWidth={1.75} />
                <span className="text-xs font-medium" style={{ color: colors.stone }}>
                  {s.label}
                </span>
              </div>
              <p className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {data.classes && data.classes.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {data.classes.map((c) => (
            <span
              key={c}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: colors.soft, color: colors.primary }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 font-serif text-lg font-semibold" style={{ color: colors.primary }}>
        Kazi za haraka
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="group flex flex-col rounded-xl border bg-white p-4 transition-colors"
              style={{ borderColor: colors.line }}
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: colors.soft, color: colors.primary }}
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold" style={{ color: colors.ink }}>
                {q.label}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: colors.stone }}>
                {q.desc}
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: colors.primary }}
              >
                Fungua
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

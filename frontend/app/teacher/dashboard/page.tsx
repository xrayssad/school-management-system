"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { Users, BookOpen, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
import { useAuth } from "@/lib/auth-context";

type Stats = {
  student_count: number;
  class_count: number;
  subject_count: number;
  classes: string[];
  subjects: string[];
};

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Stats>("/teacher/dashboard-stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Wanafunzi (madarasa yangu)", value: stats?.student_count ?? "—", icon: Users },
    { label: "Madarasa", value: stats?.class_count ?? "—", icon: LayoutGrid },
    { label: "Masomo", value: stats?.subject_count ?? "—", icon: BookOpen },
  ];

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Assalamu alaikum{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Takwimu kulingana na mgawo wa Kamati
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: colors.stone }}>
                <Icon size={14} /> {c.label}
              </div>
              <p className="mt-2 font-serif text-3xl font-semibold" style={{ color: colors.primary }}>{c.value}</p>
            </div>
          );
        })}
      </div>
      {stats && (
        <div className="mt-6 rounded-xl border bg-white p-4 text-sm" style={{ borderColor: colors.line }}>
          <p className="font-semibold" style={{ color: colors.primary }}>Madarasa</p>
          <p style={{ color: colors.stone }}>{stats.classes.length ? stats.classes.join(", ") : "—"}</p>
          <p className="mt-3 font-semibold" style={{ color: colors.primary }}>Masomo</p>
          <p style={{ color: colors.stone }}>{stats.subjects.length ? stats.subjects.join(", ") : "—"}</p>
        </div>
      )}
    </div>
  );
}

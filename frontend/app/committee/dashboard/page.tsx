"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingDown,
  Megaphone,
  ArrowRight,
  CalendarClock,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { committeeApi } from "@/lib/api";
import type { CommitteeDashboardStats } from "@/lib/types";
import { colors } from "@/lib/colors";

function formatMoney(amount: number) {
  return `TSh ${amount.toLocaleString("sw-TZ")}`;
}

export default function CommitteeDashboardPage() {
  const [stats, setStats] = useState<CommitteeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await committeeApi.dashboard();
      setStats(data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imeshindikana kupakia dashibodi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Wanafunzi", value: String(stats.total_students), icon: GraduationCap, href: "/committee/students" },
        { label: "Walimu", value: String(stats.total_teachers), icon: Users, href: "/committee/teachers" },
      ]
    : [];

  const quick = [
    { href: "/committee/announcements", label: "Tangazo", icon: Megaphone },
    { href: "/committee/exams", label: "Mitihani", icon: CalendarClock },
    { href: "/committee/timetable", label: "Ratiba", icon: Calendar },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
            Dashibodi ya Kamati
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.stone }}>
            Muhtasari wa haraka wa madrasa
            {updatedAt && (
              <span className="ml-2 text-xs">
                · Sasishwa {updatedAt.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: colors.line, color: colors.primary }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Sasisha
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
          Inapakia…
        </div>
      ) : stats ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
                  style={{ borderColor: colors.line }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft }}>
                      <Icon size={20} style={{ color: colors.primary }} />
                    </div>
                    <ArrowRight size={16} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: colors.primary }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: colors.stone }}>{item.label}</p>
                  <p className="mt-1 text-xl font-semibold" style={{ color: colors.primary }}>{item.value}</p>
                </Link>
              );
            })}
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.primary }}>
              Vitendo vya haraka
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quick.map((q) => {
                const Icon = q.icon;
                return (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm font-medium"
                    style={{ borderColor: colors.line, color: colors.ink }}
                  >
                    <Icon size={16} style={{ color: colors.primary }} />
                    {q.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: colors.line }}>
              <div className="flex items-center gap-2">
                <Megaphone size={18} style={{ color: colors.primary }} />
                <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Matangazo ya hivi karibuni</h2>
              </div>
              <Link href="/committee/announcements" className="text-xs font-medium hover:underline" style={{ color: colors.primary }}>
                Ona yote
              </Link>
            </div>
            {stats.recent_announcements.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna matangazo bado.</p>
            ) : (
              <ul>
                {stats.recent_announcements.map((a) => (
                  <li key={a.id} className="border-b px-5 py-4 last:border-b-0" style={{ borderColor: colors.line }}>
                    <p className="text-sm font-medium" style={{ color: colors.ink }}>{a.title}</p>
                    <p className="mt-1 text-xs" style={{ color: colors.stone }}>
                      {new Date(a.created_at).toLocaleDateString("sw-TZ")}
                      {a.target_class_name ? ` · ${a.target_class_name}` : " · Wanafunzi wote"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

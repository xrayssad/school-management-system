"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { TimetableEntry } from "@/lib/types";
import { colors } from "@/lib/colors";

const DAYS = [
  { en: "Monday", sw: "Jumatatu" },
  { en: "Tuesday", sw: "Jumanne" },
  { en: "Wednesday", sw: "Jumatano" },
  { en: "Thursday", sw: "Alhamisi" },
  { en: "Friday", sw: "Ijumaa" },
];

function entryLabel(entry: TimetableEntry) {
  if (entry.entry_type === "break") return "Mapumziko";
  if (entry.entry_type === "prayer") return "Sala";
  if (entry.entry_type === "workshop") return "Warsha";
  return entry.subject?.name ?? "Kipindi";
}

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TimetableEntry[]>("/timetable").then(setEntries).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Ratiba ya wiki" subtitle="Vipindi vya darasa lako wiki hii" />
      {entries.length === 0 ? (
        <EmptyState title="Hakuna ratiba bado" description="Mwalimu bado hajaweka ratiba ya darasa lako." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {DAYS.map((day) => {
            const dayEntries = entries.filter((e) => e.day_of_week === day.en);
            return (
              <div key={day.en}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.primary }}>{day.sw}</h2>
                <div className="space-y-2">
                  {dayEntries.length === 0 && <p className="text-xs" style={{ color: colors.stone }}>Hakuna vipindi</p>}
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: colors.line,
                        backgroundColor: entry.entry_type !== "lesson" ? colors.soft : "#fff",
                      }}
                    >
                      <p className="flex items-center gap-1 text-xs" style={{ color: colors.stone }}>
                        <Clock size={11} /> {entry.start_time} – {entry.end_time}
                      </p>
                      <p className="mt-1 text-sm font-medium" style={{ color: colors.ink }}>{entryLabel(entry)}</p>
                      {entry.teacher_name && <p className="mt-0.5 text-xs" style={{ color: colors.stone }}>{entry.teacher_name}</p>}
                      {entry.room && <p className="text-xs" style={{ color: colors.stone }}>{entry.room}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

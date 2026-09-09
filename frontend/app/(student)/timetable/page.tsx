"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { TimetableEntry } from "@/lib/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<TimetableEntry[]>("/timetable")
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Weekly timetable" subtitle="Your class schedule for this week" />
      {entries.length === 0 ? (
        <EmptyState title="No timetable yet" description="Your teacher hasn't published a schedule for your class." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          {DAYS.map((day) => {
            const dayEntries = entries.filter((e) => e.day_of_week === day);
            return (
              <div key={day}>
                <h2 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-teal-800">{day}</h2>
                <div className="space-y-3">
                  {dayEntries.length === 0 && <p className="text-xs text-ink-400">No lessons</p>}
                  {dayEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className={entry.entry_type !== "lesson" ? "bg-sage/60" : ""}
                    >
                      <p className="text-xs text-ink-400">{entry.start_time} &ndash; {entry.end_time}</p>
                      <p className="mt-1 font-medium text-ink">
                        {entry.entry_type === "break" ? "Break" : entry.entry_type === "prayer" ? "Prayer" : entry.entry_type === "workshop" ? "Workshop" : entry.subject?.name}
                      </p>
                      {entry.teacher_name && <p className="mt-0.5 text-xs text-ink-400">{entry.teacher_name}</p>}
                      {entry.room && <p className="text-xs text-ink-400">{entry.room}</p>}
                    </Card>
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

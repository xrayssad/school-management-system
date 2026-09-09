"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { SchoolEvent } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<SchoolEvent[]>("/events")
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Events" subtitle="Upcoming happenings at the madrasa" />
      {events.length === 0 ? (
        <EmptyState title="No events scheduled" />
      ) : (
        <div className="space-y-4">
          {events.map((e, i) => (
            <Card key={e.id} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-teal-700 text-white">
                <span className="text-xs font-medium">{new Date(e.event_date).toLocaleDateString(undefined, { month: "short" })}</span>
                <span className="font-serif text-lg font-semibold leading-none">{new Date(e.event_date).getDate()}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">{e.title}</h3>
                {e.description && <p className="mt-1 text-sm text-ink-600">{e.description}</p>}
                {e.location && <p className="mt-1 text-xs text-ink-400">{e.location}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

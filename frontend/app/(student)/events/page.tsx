"use client";

import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import { api } from "@/lib/api";
import type { SchoolEvent } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function EventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<SchoolEvent[]>("/events").then(setEvents).finally(() => setLoading(false));
  }, []);

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <PageHeader title="Matukio" subtitle="Matukio yanayokuja madrasani" />
      {events.length === 0 ? (
        <EmptyState title="Hakuna matukio yaliyopangwa" />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="flex gap-4 rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg text-white" style={{ backgroundColor: colors.primary }}>
                <span className="text-[10px] font-medium uppercase">{new Date(e.event_date).toLocaleDateString("sw-TZ", { month: "short" })}</span>
                <span className="font-serif text-lg font-semibold leading-none">{new Date(e.event_date).getDate()}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold" style={{ color: colors.ink }}>{e.title}</h3>
                {e.description && <p className="mt-1 text-sm" style={{ color: colors.stone }}>{e.description}</p>}
                {e.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: colors.stone }}>
                    <MapPin size={12} /> {e.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

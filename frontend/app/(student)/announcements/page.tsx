"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api } from "@/lib/api";
import type { Announcement } from "@/lib/types";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Announcement[]>("/announcements")
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Updates from your teachers and the madrasa" />
      {items.length === 0 ? (
        <EmptyState title="No announcements" />
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-lg font-semibold text-ink">{a.title}</h3>
                {a.priority !== "normal" && <Badge tone={a.priority === "urgent" ? "red" : "gold"}>{a.priority}</Badge>}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{a.message}</p>
              <p className="mt-3 text-xs text-ink-400">
                {a.teacher_name ?? "Madrasa Administration"} &middot; {new Date(a.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

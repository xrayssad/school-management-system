"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Spinner, EmptyState } from "@/components/Card";
import Badge from "@/components/Badge";
import { api } from "@/lib/api";
import type { Announcement } from "@/lib/types";
import { colors } from "@/lib/colors";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Announcement[]>("/announcements").then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Matangazo" subtitle="Taarifa kutoka kwa walimu na madrasa" />
      {items.length === 0 ? (
        <EmptyState title="Hakuna matangazo" />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft, color: colors.primary }}>
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold" style={{ color: colors.ink }}>{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: colors.stone }}>{a.message}</p>
                    <p className="mt-2 text-xs" style={{ color: colors.stone }}>
                      {a.teacher_name ?? "Uongozi wa madrasa"} · {new Date(a.created_at).toLocaleDateString("sw-TZ")}
                    </p>
                  </div>
                </div>
                {a.priority !== "normal" && (
                  <Badge tone={a.priority === "urgent" ? "red" : "gold"}>{a.priority}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

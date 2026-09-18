"use client";

import { useEffect, useState } from "react";
import { Megaphone, Paperclip } from "lucide-react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

export type Ann = {
  id: string;
  title: string;
  message: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  created_at?: string;
  teacher_name?: string | null;
};

function mediaUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `http://localhost:8000${url}`;
}

function isImage(a: Ann) {
  const u = (a.attachment_url || "").toLowerCase();
  const t = (a.attachment_type || "").toLowerCase();
  return t === "image" || t.includes("image") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u);
}

export default function AnnouncementsList({ subtitle }: { subtitle?: string }) {
  const [items, setItems] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Ann[]>("/announcements")
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : "Imeshindikana"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Matangazo
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        {subtitle || "Taarifa kutoka kwa Kamati na walimu"}
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm" style={{ color: colors.stone }}>Inapakia…</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((a) => {
            const href = mediaUrl(a.attachment_url);
            return (
              <article key={a.id} className="rounded-xl border bg-white p-4" style={{ borderColor: colors.line }}>
                <div className="flex items-start gap-2">
                  <Megaphone size={16} className="mt-0.5 shrink-0" style={{ color: colors.primary }} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold" style={{ color: colors.ink }}>{a.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm" style={{ color: colors.stone }}>{a.message}</p>
                    {href && (
                      <div className="mt-3">
                        {isImage(a) ? (
                          <a href={href} target="_blank" rel="noreferrer">
                            <img
                              src={href}
                              alt={a.attachment_name || "Picha"}
                              className="max-h-72 w-auto max-w-full rounded-lg border object-contain"
                              style={{ borderColor: colors.line }}
                            />
                          </a>
                        ) : (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium underline"
                            style={{ color: colors.primary }}
                          >
                            <Paperclip size={14} />
                            {a.attachment_name || "Pakua kiambatisho"}
                          </a>
                        )}
                      </div>
                    )}
                    <p className="mt-3 text-xs" style={{ color: colors.stone }}>
                      {a.teacher_name || "Kamati"}
                      {a.created_at ? ` · ${new Date(a.created_at).toLocaleString("sw-TZ")}` : ""}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
          {!items.length && (
            <p className="text-sm" style={{ color: colors.stone }}>Hakuna matangazo.</p>
          )}
        </div>
      )}
    </div>
  );
}

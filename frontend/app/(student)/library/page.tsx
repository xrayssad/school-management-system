"use client";
import MadrasaLoader from "@/components/MadrasaLoader";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Item = {
  id: string;
  title: string;
  item_type: string;
  class_name?: string | null;
  subject_name?: string | null;
  term?: string | null;
  file_url: string;
  file_name?: string;
  description?: string;
};

function fileHref(url: string) {
  return url.startsWith("http") ? url : `http://localhost:8000${url}`;
}

const TYPE_LABEL: Record<string, string> = {
  book: "Kitabu",
  past_paper: "Past paper",
  other: "Nyingine",
};

export default function StudentLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = filter ? `?item_type=${filter}` : "";
    api
      .get<Item[]>(`/library${q}`)
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message || "Imeshindikana"))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <MadrasaLoader />;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
        Maktaba
      </h1>
      <p className="mt-1 text-sm" style={{ color: colors.stone }}>
        Vitabu vya darasa, rejea, na past papers
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ["", "Zote"],
          ["book", "Vitabu"],
          ["past_paper", "Past papers"],
          ["other", "Nyingine"],
        ].map(([v, l]) => (
          <button
            key={v || "all"}
            type="button"
            onClick={() => setFilter(v)}
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              borderColor: filter === v ? colors.primary : colors.line,
              color: filter === v ? colors.primary : colors.stone,
            }}
          >
            {l}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3"
            style={{ borderColor: colors.line }}
          >
            <div>
              <p className="font-medium text-sm">{it.title}</p>
              <p className="text-xs" style={{ color: colors.stone }}>
                {TYPE_LABEL[it.item_type] || it.item_type}
                {it.class_name ? ` · ${it.class_name}` : " · Jumla"}
                {it.subject_name ? ` · ${it.subject_name}` : ""}
                {it.term ? ` · ${it.term}` : ""}
              </p>
            </div>
            <a
              href={fileHref(it.file_url)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline"
              style={{ color: colors.primary }}
            >
              Pakua
            </a>
          </div>
        ))}
        {!items.length && !error && (
          <p className="text-sm" style={{ color: colors.stone }}>
            Hakuna faili bado.
          </p>
        )}
      </div>
    </div>
  );
}

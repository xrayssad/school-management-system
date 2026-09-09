export default function StatCard({
  label,
  value,
  sublabel,
  accent = "#0B4F45",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl2 border border-teal-100/60 bg-white p-5 shadow-soft" style={{ borderLeftWidth: 4, borderLeftColor: accent }}>
      <p className="text-sm text-ink-400">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-ink">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
    </div>
  );
}

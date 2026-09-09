export function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-xl2 border border-teal-100/60 bg-white p-5 shadow-soft ${className}`} style={style}>{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl2 border border-dashed border-teal-200 bg-white/60 p-10 text-center">
      <p className="font-serif text-lg font-medium text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
    </div>
  );
}

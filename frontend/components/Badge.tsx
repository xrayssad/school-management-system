export default function Badge({
  children,
  tone = "teal",
}: {
  children: React.ReactNode;
  tone?: "teal" | "gold" | "red" | "neutral";
}) {
  const tones: Record<string, string> = {
    teal: "bg-teal-50 text-teal-800",
    gold: "bg-gold-50 text-gold-700",
    red: "bg-red-50 text-red-700",
    neutral: "bg-sage text-ink-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

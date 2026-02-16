export function ResultCard({
  label,
  value,
  unit,
  accent,
  large,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <span className="text-xs text-zinc-500 font-mono">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono font-semibold ${large ? "text-lg" : "text-sm"} ${accent ? "text-green-400" : "text-zinc-100"}`}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-zinc-600">{unit}</span>}
      </div>
    </div>
  );
}

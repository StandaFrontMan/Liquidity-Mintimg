export function StatRow({
  label,
  value,
  unit,
  accent,
  loading,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-xs text-zinc-500 font-mono">{label}</span>
      {loading ? (
        <div className="h-3.5 w-16 bg-zinc-800 rounded animate-pulse" />
      ) : (
        <span
          className={`text-sm font-mono font-semibold ${accent ? "text-green-400" : "text-zinc-100"}`}
        >
          {value}
          {unit && (
            <span className="text-zinc-600 font-normal ml-1 text-xs">
              {unit}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

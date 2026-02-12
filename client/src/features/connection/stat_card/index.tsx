export function StatCard({
  label,
  value,
  unit,
  accent = false,
  loading = false,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-1 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden group hover:border-zinc-700 transition-colors duration-200">
      {accent && (
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
      )}

      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
        {label}
      </span>

      {loading ? (
        <div className="h-7 w-20 rounded bg-zinc-800 animate-pulse mt-0.5" />
      ) : (
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span
            className={`text-2xl font-bold tracking-tight ${
              accent ? "text-green-400" : "text-zinc-100"
            }`}
            style={
              accent
                ? { textShadow: "0 0 20px rgba(74,222,128,0.4)" }
                : undefined
            }
          >
            {value}
          </span>
          {unit && (
            <span className="text-sm text-zinc-500 font-medium">{unit}</span>
          )}
        </div>
      )}
    </div>
  );
}

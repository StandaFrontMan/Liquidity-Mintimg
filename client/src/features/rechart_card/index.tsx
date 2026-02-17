export function ChartCard({
  title,
  subtitle,
  loading,
  empty,
  children,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-100">{title}</p>
        <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{subtitle}</p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
        </div>
      ) : empty ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-zinc-600 text-xs font-mono">No data yet</p>
        </div>
      ) : (
        <div className="h-40">{children}</div>
      )}
    </div>
  );
}

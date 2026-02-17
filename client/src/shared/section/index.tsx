export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

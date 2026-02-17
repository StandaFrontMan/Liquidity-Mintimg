export function InputRow({
  label,
  hint,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-zinc-300 font-mono">{label}</p>
        <p className="text-[10px] text-zinc-600 font-mono">{hint}</p>
      </div>
      <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 focus-within:border-green-500/50 transition-colors">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-zinc-100 font-mono text-sm outline-none placeholder:text-zinc-700"
        />
        <span className="text-zinc-600 font-mono text-xs">{unit}</span>
      </div>
    </div>
  );
}

export function TxButton({
  onClick,
  isPending,
  isConfirming,
  isConfirmed,
  disabled,
  label,
}: {
  onClick: () => void;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPending || isConfirming}
      className="w-full py-2.5 rounded-xl bg-green-500 text-black font-bold text-sm hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-4"
    >
      {isPending
        ? "Confirm in wallet..."
        : isConfirming
          ? "Confirming..."
          : isConfirmed
            ? "✓ Done"
            : label}
    </button>
  );
}

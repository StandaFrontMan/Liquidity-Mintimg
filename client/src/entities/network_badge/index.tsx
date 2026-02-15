export function NetworkBadge({ chainId }: { chainId: number }) {
  const networks: Record<number, { name: string; color: string; dot: string }> =
    {
      31337: { name: "Anvil", color: "text-yellow-400", dot: "bg-yellow-400" },
      11155111: { name: "Sepolia", color: "text-blue-400", dot: "bg-blue-400" },
      1: { name: "Mainnet", color: "text-green-400", dot: "bg-green-400" },
    };

  const net = networks[chainId] ?? {
    name: `Chain ${chainId}`,
    color: "text-zinc-400",
    dot: "bg-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono ${net.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${net.dot} animate-pulse`} />
      {net.name}
    </span>
  );
}

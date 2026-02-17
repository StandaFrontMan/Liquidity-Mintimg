import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { formatEther } from "viem";
import { useReadContracts } from "wagmi";

export interface APYEvent {
  apy: bigint;
  totalStaked: bigint;
  timestamp: bigint;
}

export function APYCurve({
  contractAddress,
  currentTVL,
}: {
  contractAddress: `0x${string}`;
  currentTVL: bigint;
}) {
  const ETH_POINTS = [5n, 10n, 25n, 50n, 75n, 100n, 150n, 200n, 300n, 500n];

  const { data, isLoading } = useReadContracts({
    contracts: ETH_POINTS.map((eth) => ({
      address: contractAddress,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "previewApy" as const,
      args: [eth * 10n ** 18n] as const,
    })),
    query: {
      refetchInterval: 5_000,
    },
  });

  const points = ETH_POINTS.map((eth, i) => ({
    eth: Number(eth),
    apy: Number(data?.[i]?.result ?? 0n),
  }));

  const maxApy = Math.max(...points.map((p) => p.apy), 1);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {ETH_POINTS.map((e) => (
          <div key={e} className="flex items-center gap-3">
            <div className="w-14 h-3 bg-zinc-800 rounded animate-pulse" />
            <div className="flex-1 h-5 bg-zinc-800 rounded animate-pulse" />
            <div className="w-8 h-3 bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {points.map(({ eth, apy }) => {
          const currentEth = Number(formatEther(currentTVL));
          const isCurrentTVL = Math.abs(eth - currentEth) < eth * 0.3;

          const pct = maxApy > 0 ? (apy / maxApy) * 100 : 0;
          const color =
            apy >= 80
              ? "from-green-500/70 to-green-400"
              : apy >= 30
                ? "from-green-600/50 to-green-500/70"
                : "from-zinc-600/50 to-zinc-500/70";

          return (
            <div key={eth} className="flex items-center gap-3">
              <span
                className={`text-[10px] font-mono w-14 text-right shrink-0 ${isCurrentTVL ? "text-green-400" : "text-zinc-600"}`}
              >
                {eth} ETH
                {isCurrentTVL && " ◄"}
              </span>
              <div className="flex-1 h-5 bg-zinc-800/60 rounded-md overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-md transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-mono font-semibold w-10 shrink-0 text-right ${
                  apy >= 80
                    ? "text-green-400"
                    : apy <= 10
                      ? "text-zinc-600"
                      : "text-zinc-300"
                }`}
              >
                {apy}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1">
        <p className="text-[10px] text-zinc-500 font-mono">
          How to read: each row shows the APY you would earn if the pool had
          that much ETH staked.
        </p>
        <p className="text-[10px] text-zinc-600 font-mono">
          More ETH in pool → lower APY. Less ETH → higher APY. Your current pool
          position is marked ◄
        </p>
      </div>
    </div>
  );
}

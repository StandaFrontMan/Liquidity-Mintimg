import { formatBalance, formatTVL } from "@/lib/utils";
import { useReadContract } from "wagmi";
import { StatCard } from "../stat_card";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { CONTRACT_ADDRESSES } from "@/config/addresses";

export function PoolStats() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES[31337].LIQUIDITY_STAKING,
    abi: LIQIUDITY_STAKING_ABI,
    functionName: "getPoolInfo",
    query: {
      refetchInterval: 5_000,
    },
  });

  const [tvl, apy, rewardRate, contractBalance] = data ?? [0n, 0n, 0n, 0n];

  const dailyRewardPerEth =
    rewardRate > 0n ? ((Number(rewardRate) / 1e18) * 86400).toFixed(4) : "—";

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Pool Statistics
        </p>
        {isLoading && (
          <span className="text-[10px] text-zinc-600 font-mono animate-pulse">
            syncing...
          </span>
        )}
        {!isLoading && (
          <span className="text-[10px] text-zinc-600 font-mono">
            updates every 5s
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Value Locked"
          value={formatTVL(tvl)}
          unit="ETH"
          loading={isLoading}
        />
        <StatCard
          label="Current APY"
          value={apy > 0n ? apy.toString() : "—"}
          unit="%"
          accent
          loading={isLoading}
        />
        <StatCard
          label="Reward Pool"
          value={formatBalance(contractBalance)}
          unit="REW"
          loading={isLoading}
        />
        <StatCard
          label="Rate / ETH / day"
          value={isLoading ? "—" : dailyRewardPerEth}
          unit="REW"
          loading={isLoading}
        />
      </div>

      {!isLoading && apy > 0n && (
        <div className="mt-4 px-3 py-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-green-400 font-semibold">Dynamic APY</span> —
            rate adjusts based on TVL.{" "}
            {tvl === 0n
              ? "Be the first staker and earn maximum APY."
              : `Currently ${apy}% APY. ${apy < 20n ? "APY is at minimum." : apy > 80n ? "High APY — pool is under target TVL." : "Healthy pool utilization."}`}
          </p>
        </div>
      )}
    </div>
  );
}

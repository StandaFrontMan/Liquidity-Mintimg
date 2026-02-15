import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";
import { APYCurve } from "@/features";
import { fmtEth, fmtTokens } from "@/lib/utils";
import { Section, StatRow } from "@/shared";
import { useState } from "react";
import {
  useBlockNumber,
  useChainId,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";

interface APYEvent {
  apy: bigint;
  totalStaked: bigint;
  timestamp: bigint;
}

export default function Analytics() {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const address = addresses?.LIQUIDITY_STAKING;

  const [apyEvents, setApyEvents] = useState<APYEvent[]>([]);

  const { data: blockNumber } = useBlockNumber({ watch: true });

  /**
   * @return currentTVL
   * @return currentAPY
   * @return rewardRate
   * @return contractBalance
   */
  const { data: pool, isLoading } = useReadContract({
    address: address,
    abi: LIQIUDITY_STAKING_ABI,
    functionName: "getPoolInfo",
    query: {
      enabled: !!address,
      refetchInterval: 5_000,
    },
  });

  useWatchContractEvent({
    abi: LIQIUDITY_STAKING_ABI,
    eventName: "APYUpdated",
    onLogs(logs) {
      const incoming: APYEvent[] = logs.map((log: any) => ({
        apy: log.args.curApy as bigint,
        totalStaked: log.args.totalStaked as bigint,
        timestamp: log.args.timeStamp as bigint,
      }));
      setApyEvents((prev) => [...prev, ...incoming].slice(-30));
    },
  });

  const tvl = pool?.[0] ?? 0n;
  const apy = pool?.[1] ?? 0n;
  const rewardRate = pool?.[2] ?? 0n;
  const contractBalance = pool?.[3] ?? 0n;

  // Расчёты
  const dailyPerEth =
    rewardRate > 0n ? ((Number(rewardRate) / 1e18) * 86_400).toFixed(6) : "—";

  const yearlyPayout =
    tvl > 0n && rewardRate > 0n
      ? fmtTokens((tvl * rewardRate * 31_536_000n) / 10n ** 18n)
      : "0";

  const utilization =
    tvl > 0n ? Math.min(100, Math.round((Number(fmtEth(tvl)) / 100) * 100)) : 0;

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-600 text-sm font-mono">Unsupported network</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
            Analytics
          </h1>
          <p className="text-zinc-600 text-[11px] font-mono mt-0.5">
            Block #{blockNumber?.toString() ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-600">live</span>
        </div>
      </div>

      {/* Row 1: Pool Metrics + Reward Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Pool Metrics">
          <StatRow
            label="Total Value Locked"
            value={fmtEth(tvl)}
            unit="ETH"
            loading={isLoading}
          />
          <StatRow
            label="Current APY"
            value={apy.toString()}
            unit="%"
            accent
            loading={isLoading}
          />
          <StatRow
            label="Reward Pool Balance"
            value={fmtTokens(contractBalance)}
            unit="REW"
            loading={isLoading}
          />
          <StatRow
            label="Pool Utilization"
            value={`${utilization}`}
            unit="% of target"
            loading={isLoading}
          />
        </Section>

        <Section title="Reward Rates">
          <StatRow
            label="Per ETH per second"
            value={
              rewardRate > 0n
                ? (Number(rewardRate) / 1e18).toExponential(3)
                : "—"
            }
            loading={isLoading}
          />
          <StatRow
            label="Per ETH per day"
            value={dailyPerEth}
            unit="REW"
            loading={isLoading}
          />
          <StatRow
            label="Per ETH per year"
            value={apy > 0n ? apy.toString() : "—"}
            unit="% APY"
            accent
            loading={isLoading}
          />
          <StatRow
            label="Total yearly payout"
            value={yearlyPayout}
            unit="REW"
            loading={isLoading}
          />
        </Section>
      </div>

      <Section title="APY vs TVL — Curve Simulation">
        <APYCurve contractAddress={address} currentTVL={tvl} />
      </Section>

      {/* <Section
        title={`Live APY Events${apyEvents.length > 0 ? ` · ${apyEvents.length}` : ""}`}
      >
        <EventFeed events={apyEvents} />
      </Section> */}
    </div>
  );
}

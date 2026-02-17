import { useEffect, useState } from "react";
import { useChainId, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fmtTime, toEth } from "@/lib/utils";
import { ChartCard, ChartTooltip } from "@/features";

interface TVLPoint {
  time: string;
  tvl: number;
  apy: number;
}

interface VolumePoint {
  time: string;
  staked: number;
  unstaked: number;
}

interface RewardPoint {
  time: string;
  rewards: number;
  cumulative: number;
}

export default function Charts() {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const address = addresses?.LIQUIDITY_STAKING;
  const client = usePublicClient();

  const [tvlData, setTvlData] = useState<TVLPoint[]>([]);
  const [volumeData, setVolumeData] = useState<VolumePoint[]>([]);
  const [rewardData, setRewardData] = useState<RewardPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || !address) return;

    async function load() {
      setLoading(true);
      try {
        const [apyLogs, stakedLogs, unstakedLogs, claimedLogs] =
          await Promise.all([
            client!.getLogs({
              address,
              event: parseAbiItem(
                "event APYUpdated(uint256 curApy, uint256 totalStaked, uint256 timeStamp)",
              ),
              fromBlock: 0n,
              toBlock: "latest",
            }),
            client!.getLogs({
              address,
              event: parseAbiItem(
                "event Staked(address indexed stakerAddress, uint256 amount, uint256 stakeTime)",
              ),
              fromBlock: 0n,
              toBlock: "latest",
            }),
            client!.getLogs({
              address,
              event: parseAbiItem(
                "event Unstaked(address indexed unstakedAddress, uint256 ethAmount, uint256 rewardAmount, uint256 unstakeTime)",
              ),
              fromBlock: 0n,
              toBlock: "latest",
            }),
            client!.getLogs({
              address,
              event: parseAbiItem(
                "event Claimed(address indexed claimedAddress, uint256 amount, uint256 claimedTime)",
              ),
              fromBlock: 0n,
              toBlock: "latest",
            }),
          ]);

        // ── TVL + APY
        const tvlPoints: TVLPoint[] = apyLogs.map((log, i) => ({
          time: `#${log.blockNumber?.toString() ?? i}`,
          tvl: toEth(log.args.totalStaked ?? 0n),
          apy: Number(log.args.curApy ?? 0n),
        }));
        setTvlData(tvlPoints);

        // ── Volume
        const volumeMap = new Map<
          string,
          { staked: number; unstaked: number }
        >();

        stakedLogs.forEach((log) => {
          const time = fmtTime(log.args.stakeTime ?? 0n);
          const prev = volumeMap.get(time) ?? { staked: 0, unstaked: 0 };
          volumeMap.set(time, {
            ...prev,
            staked: prev.staked + toEth(log.args.amount ?? 0n),
          });
        });

        unstakedLogs.forEach((log) => {
          const time = fmtTime(log.args.unstakeTime ?? 0n);
          const prev = volumeMap.get(time) ?? { staked: 0, unstaked: 0 };
          volumeMap.set(time, {
            ...prev,
            unstaked: prev.unstaked + toEth(log.args.ethAmount ?? 0n),
          });
        });

        const volumePoints: VolumePoint[] = Array.from(volumeMap.entries()).map(
          ([time, v]) => ({ time, ...v }),
        );
        setVolumeData(volumePoints);

        // ── Rewards
        let cumulative = 0;
        const rewardPoints: RewardPoint[] = claimedLogs.map((log) => {
          const amount = toEth(log.args.amount ?? 0n);
          cumulative += amount;
          return {
            time: fmtTime(log.args.claimedTime ?? 0n),
            rewards: amount,
            cumulative: parseFloat(cumulative.toFixed(4)),
          };
        });
        setRewardData(rewardPoints);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [client, address]);

  const gridProps = {
    strokeDasharray: "3 3",
    stroke: "#27272a",
    vertical: false,
  };

  const axisProps = {
    tick: { fontSize: 9, fontFamily: "monospace", fill: "#52525b" },
    axisLine: false,
    tickLine: false,
  };

  const tooltipProps = {
    content: <ChartTooltip />,
    cursor: { stroke: "#3f3f46", strokeWidth: 1 },
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-600 text-sm font-mono">Unsupported network</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
          Charts
        </h1>
        <p className="text-zinc-600 text-[11px] font-mono mt-0.5">
          Historical data from on-chain events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="Total Value Locked"
          subtitle="ETH staked over time · from APYUpdated events"
          loading={loading}
          empty={tvlData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tvlData}>
              <defs>
                <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} unit=" ETH" width={55} />
              <Tooltip
                {...tooltipProps}
                content={<ChartTooltip unit="ETH" />}
              />
              <Area
                type="monotone"
                dataKey="tvl"
                name="TVL"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#tvlGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="APY History"
          subtitle="% yield over time · from APYUpdated events"
          loading={loading}
          empty={tvlData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tvlData}>
              <defs>
                <linearGradient id="apyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} unit="%" width={35} />
              <Tooltip {...tooltipProps} content={<ChartTooltip unit="%" />} />
              <Area
                type="stepAfter"
                dataKey="apy"
                name="APY"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#apyGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#4ade80" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="Staking Volume"
          subtitle="ETH staked vs unstaked · from Staked/Unstaked events"
          loading={loading}
          empty={volumeData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} barGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} unit=" ETH" width={55} />
              <Tooltip
                {...tooltipProps}
                content={<ChartTooltip unit="ETH" />}
              />
              <Bar
                dataKey="staked"
                name="Staked"
                fill="#22c55e"
                fillOpacity={0.8}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="unstaked"
                name="Unstaked"
                fill="#ef4444"
                fillOpacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Rewards Distributed"
          subtitle="Cumulative REW tokens claimed · from Claimed events"
          loading={loading}
          empty={rewardData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rewardData}>
              <defs>
                <linearGradient id="rewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86efac" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#86efac" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} unit=" REW" width={60} />
              <Tooltip
                {...tooltipProps}
                content={<ChartTooltip unit="REW" />}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Total Rewards"
                stroke="#86efac"
                strokeWidth={2}
                fill="url(#rewGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#86efac" }}
              />
              <Area
                type="monotone"
                dataKey="rewards"
                name="Per Claim"
                stroke="#4ade80"
                strokeWidth={1}
                strokeDasharray="3 3"
                fill="none"
                dot={{ r: 3, fill: "#4ade80" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

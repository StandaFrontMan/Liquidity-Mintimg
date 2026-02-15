import { fmtEth, fmtTime } from "@/lib/utils";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { useEffect, useState } from "react";
import { useChainId, usePublicClient, useWatchContractEvent } from "wagmi";
import { parseAbiItem } from "viem";
import type { APYEvent } from "../apy_curve";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";

export function EventFeed() {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const address = addresses?.LIQUIDITY_STAKING;

  const client = usePublicClient();
  const [events, setEvents] = useState<APYEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || !address) return;

    setLoading(true);

    client
      .getLogs({
        address: address,
        event: parseAbiItem(
          "event APYUpdated(uint256 curApy, uint256 totalStaked, uint256 timeStamp)",
        ),
        fromBlock: 0n,
        toBlock: "latest",
      })
      .then((logs) => {
        const historical: APYEvent[] = logs.map((log) => ({
          apy: log.args.curApy ?? 0n,
          totalStaked: log.args.totalStaked ?? 0n,
          timestamp: log.args.timeStamp ?? 0n,
        }));
        setEvents(historical);
      })
      .finally(() => setLoading(false));
  }, [client, address]);

  useWatchContractEvent({
    address: address,
    abi: LIQIUDITY_STAKING_ABI,
    eventName: "APYUpdated",
    onLogs(logs) {
      const incoming: APYEvent[] = logs.map((log) => ({
        apy: log.args.curApy as bigint,
        totalStaked: log.args.totalStaked as bigint,
        timestamp: log.args.timeStamp as bigint,
      }));
      setEvents((prev) => [...prev, ...incoming].slice(-50));
    },
  });

  if (loading) {
    return (
      <div className="space-y-1.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-lg bg-zinc-800/40 animate-pulse"
            style={{ opacity: 1 - i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-zinc-600 text-xs font-mono">No events yet</p>
        <p className="text-zinc-700 text-[10px] font-mono mt-1">
          Stake or unstake to see APY changes here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {[...events].reverse().map((e, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800/60"
        >
          <div className="flex items-center gap-4">
            <p className="text-green-400 font-bold font-mono text-sm w-fit ">
              <span className="text-[10px] font-mono">APY</span>{" "}
              {e.apy.toString()}%
            </p>

            <span className="text-zinc-500 text-[10px] font-mono">
              TVL: {fmtEth(e.totalStaked)} ETH
            </span>
          </div>

          <span className="text-zinc-600 text-[10px] font-mono">
            {fmtTime(e.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

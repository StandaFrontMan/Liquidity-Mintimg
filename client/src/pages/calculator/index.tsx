import { useState, useMemo } from "react";
import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { calcReward, fmtEth, fmtReward } from "@/lib/utils";
import { Section } from "@/shared";
import { DURATION_OPTIONS } from "@/config/constats";
import { ResultCard } from "@/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Calculator() {
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const address = addresses?.LIQUIDITY_STAKING;

  const [amountInput, setAmountInput] = useState("10");
  const [selectedDays, setSelectedDays] = useState(30);

  const amountEth = parseFloat(amountInput) || 0;
  const amountWei = amountEth > 0 ? parseEther(amountInput) : 0n;

  const { data: poolData } = useReadContract({
    address,
    abi: LIQIUDITY_STAKING_ABI,
    functionName: "getPoolInfo",
    query: {
      enabled: !!address,
      refetchInterval: 5_000,
    },
  });

  const currentTVL = poolData?.[0] ?? 0n;
  const currentAPY = poolData?.[1] ?? 0n;

  const hypotheticalTVL = currentTVL + amountWei;

  const { data: previewResults } = useReadContracts({
    contracts: [
      {
        address,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "previewApy" as const,
        args: [hypotheticalTVL] as const,
      },

      {
        address,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "previewApy" as const,
        args: [amountWei > 0n ? amountWei : 1n] as const,
      },
    ],
    query: { enabled: !!address && amountWei > 0n },
  });

  const apyAfterStake = Number(previewResults?.[0]?.result ?? currentAPY);

  const rewards = useMemo(() => {
    if (amountEth <= 0 || apyAfterStake <= 0) {
      return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    }
    return {
      daily: calcReward(amountEth, apyAfterStake, 1),
      weekly: calcReward(amountEth, apyAfterStake, 7),
      monthly: calcReward(amountEth, apyAfterStake, 30),
      yearly: calcReward(amountEth, apyAfterStake, 365),
    };
  }, [amountEth, apyAfterStake]);

  const selectedReward = calcReward(amountEth, apyAfterStake, selectedDays);

  const apyDelta = apyAfterStake - Number(currentAPY);
  const apyChanged = apyDelta !== 0;

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-600 text-sm font-mono">Unsupported network</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
          Calculator
        </h1>
        <p className="text-zinc-600 text-[11px] font-mono mt-0.5">
          Simulate your staking rewards before committing
        </p>
      </div>

      <Section title="Simulation Parameters">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-500 font-mono mb-2">
              Amount to stake
            </p>
            <Input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.1"
              className="flex-1 bg-transparent text-zinc-100 text-xl font-mono outline-none placeholder:text-zinc-700"
            />

            <div className="flex gap-2 mt-2">
              {[1, 5, 10, 50, 100].map((n) => (
                <Button
                  key={n}
                  onClick={() => setAmountInput(String(n))}
                  className={`flex-1 py-1 text-[10px] font-mono rounded-lg border transition-colors ${
                    amountInput === String(n)
                      ? "border-green-500/50 text-green-400 bg-green-500/5"
                      : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                  }`}
                >
                  {n} ETH
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 font-mono mb-2">Duration</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(({ label, days }) => (
                <Button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`flex-1 py-2 text-[10px] font-mono rounded-lg border transition-colors ${
                    selectedDays === days
                      ? "border-green-500/50 text-green-400 bg-green-500/5"
                      : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pool Impact */}
        <Section title="Pool Impact">
          <ResultCard
            label="Current TVL"
            value={fmtEth(currentTVL)}
            unit="ETH"
          />
          <ResultCard
            label="TVL after your stake"
            value={fmtEth(hypotheticalTVL)}
            unit="ETH"
            accent
          />
          <ResultCard label="APY now" value={currentAPY.toString()} unit="%" />
          <ResultCard
            label="APY after your stake"
            value={apyAfterStake.toString()}
            unit="%"
            accent={apyAfterStake > 0}
          />
          {apyChanged && (
            <div
              className={`mt-3 px-3 py-2 rounded-lg text-[10px] font-mono ${
                apyDelta < 0
                  ? "bg-red-500/5 border border-red-500/10 text-red-400"
                  : "bg-green-500/5 border border-green-500/10 text-green-400"
              }`}
            >
              {apyDelta < 0
                ? `Your stake lowers APY by ${Math.abs(apyDelta)}% for all stakers`
                : `Your stake increases APY by ${apyDelta}%`}
            </div>
          )}
        </Section>

        {/* Rewards */}
        <Section title={`Estimated Rewards · ${selectedDays}d`}>
          {/* Highlighted selected period */}
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/15 text-center">
            <p className="text-[10px] text-zinc-500 font-mono mb-1">
              {DURATION_OPTIONS.find((d) => d.days === selectedDays)?.label}
            </p>
            <p
              className="text-2xl font-bold text-green-400 font-mono"
              style={{ textShadow: "0 0 20px rgba(74,222,128,0.3)" }}
            >
              {fmtReward(selectedReward)}
            </p>
            <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
              REW tokens
            </p>
          </div>

          <ResultCard
            label="Daily"
            value={fmtReward(rewards.daily)}
            unit="REW"
          />
          <ResultCard
            label="Weekly"
            value={fmtReward(rewards.weekly)}
            unit="REW"
          />
          <ResultCard
            label="Monthly"
            value={fmtReward(rewards.monthly)}
            unit="REW"
          />
          <ResultCard
            label="Yearly"
            value={fmtReward(rewards.yearly)}
            unit="REW"
            accent
          />
        </Section>
      </div>

      {/* Formula explanation */}
      <div className="px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <p className="text-[10px] font-mono text-zinc-600 leading-relaxed">
          <span className="text-zinc-400">Formula: </span>
          reward = amount × duration × (APY / 100 / 365d)
          {amountEth > 0 && (
            <span className="text-zinc-500">
              {" "}
              · {amountEth} ETH × {selectedDays}d × ({apyAfterStake}% / 100 /
              365) ={" "}
              <span className="text-green-500">
                {fmtReward(selectedReward)} REW
              </span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

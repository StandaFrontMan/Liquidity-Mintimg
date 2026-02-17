import { useState } from "react";
import {
  useChainId,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { InputRow, Section } from "@/shared";
import { fmtEth } from "@/lib/utils";
import { TxButton } from "@/features";

export default function Owner() {
  const chainId = useChainId();
  const { address } = useConnection();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const contract = addresses?.LIQUIDITY_STAKING;

  const [targetTvlInput, setTargetTvlInput] = useState("");
  const [baseRateInput, setBaseRateInput] = useState("");
  const [minRateInput, setMinRateInput] = useState("");
  const [maxRateInput, setMaxRateInput] = useState("");

  // ── Read current values ───────────────────────────────────────────────────
  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address: contract,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "owner" as const,
      },
      {
        address: contract,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "targetTvl" as const,
      },
      {
        address: contract,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "baseRewardRatePerYear" as const,
      },
      {
        address: contract,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "minRewardRate" as const,
      },
      {
        address: contract,
        abi: LIQIUDITY_STAKING_ABI,
        functionName: "maxRewardRate" as const,
      },
    ],
    query: { enabled: !!contract, refetchInterval: 5_000 },
  });

  const ownerAddress = data?.[0]?.result as `0x${string}` | undefined;
  const targetTvl = data?.[1]?.result as bigint | undefined;
  const baseRate = data?.[2]?.result as bigint | undefined;
  const minRate = data?.[3]?.result as bigint | undefined;
  const maxRate = data?.[4]?.result as bigint | undefined;

  // ── Write ─────────────────────────────────────────────────────────────────
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      // После подтверждения — перечитываем значения
      onReplaced: () => refetch(),
    });

  // Перечитываем после успешной транзакции
  if (isConfirmed) refetch();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSetTargetTvl = () => {
    if (!contract || !targetTvlInput) return;
    writeContract({
      address: contract,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "setTargetTvl",
      args: [parseEther(targetTvlInput)],
    });
  };

  const handleSetBaseRate = () => {
    if (!contract || !baseRateInput) return;
    writeContract({
      address: contract,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "setBaseRewardRate",
      args: [BigInt(baseRateInput)],
    });
  };

  const handleSetRateLimits = () => {
    if (!contract || !minRateInput || !maxRateInput) return;
    writeContract({
      address: contract,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "setRateLimits",
      args: [BigInt(minRateInput), BigInt(maxRateInput)],
    });
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!contract) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-600 text-sm font-mono">Unsupported network</p>
      </div>
    );
  }

  const isOwner = ownerAddress?.toLowerCase() === address?.toLowerCase();

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-3xl">🔒</p>
        <p className="text-zinc-400 text-sm font-mono">Access denied</p>
        <p className="text-zinc-600 text-xs font-mono">
          Owner:{" "}
          {ownerAddress
            ? `${ownerAddress.slice(0, 8)}...${ownerAddress.slice(-6)}`
            : "—"}
        </p>
        <p className="text-zinc-700 text-xs font-mono">
          Connected:{" "}
          {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
            Admin Panel
          </h1>
          <p className="text-zinc-600 text-[11px] font-mono mt-0.5">
            Owner: {ownerAddress?.slice(0, 8)}...{ownerAddress?.slice(-6)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-green-400 text-[10px] font-mono">owner</span>
        </div>
      </div>

      {/* Current values */}
      <Section title="Current Parameters">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Target TVL",
              value: targetTvl ? `${fmtEth(targetTvl)} ETH` : "—",
            },
            {
              label: "Base Rate/Year",
              value: baseRate ? `${baseRate.toString()}%` : "—",
            },
            {
              label: "Min APY",
              value: minRate ? `${minRate.toString()}%` : "—",
            },
            {
              label: "Max APY",
              value: maxRate ? `${maxRate.toString()}%` : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="px-3 py-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800"
            >
              <p className="text-[10px] text-zinc-600 font-mono">{label}</p>
              <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-red-400 text-xs font-mono">
            {error.message.includes("InvalidRewardRate")
              ? "Invalid reward rate (must be 1-1000)"
              : error.message.includes("InvalidLimits")
                ? "Invalid limits (min must be < max)"
                : error.message.includes("ZeroAmount")
                  ? "Value cannot be zero"
                  : // @ts-expect-error shortMessage is not in all error union types
                    (error.shortMessage ?? error.message)}
          </p>
        </div>
      )}

      {/* Set Target TVL */}
      <Section title="Target TVL">
        <p className="text-[10px] text-zinc-600 font-mono mb-4">
          Target TVL defines the "base" pool size. At this TVL, APY =
          baseRewardRate. Below target → higher APY. Above target → lower APY.
        </p>
        <InputRow
          label="New Target TVL"
          hint={`current: ${targetTvl ? fmtEth(targetTvl) : "—"} ETH`}
          value={targetTvlInput}
          onChange={setTargetTvlInput}
          unit="ETH"
          placeholder={targetTvl ? fmtEth(targetTvl) : "100"}
        />
        <TxButton
          onClick={handleSetTargetTvl}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          disabled={!targetTvlInput || parseFloat(targetTvlInput) <= 0}
          label="Set Target TVL"
        />
      </Section>

      {/* Set Base Rate */}
      <Section title="Base Reward Rate">
        <p className="text-[10px] text-zinc-600 font-mono mb-4">
          Annual reward rate at target TVL. Range: 1–1000%. Example: 20 means
          20% APY when TVL = targetTVL.
        </p>
        <InputRow
          label="New Base Rate"
          hint={`current: ${baseRate?.toString() ?? "—"}% · range: 1–1000`}
          value={baseRateInput}
          onChange={setBaseRateInput}
          unit="%/year"
          placeholder={baseRate?.toString() ?? "20"}
        />
        <TxButton
          onClick={handleSetBaseRate}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          disabled={
            !baseRateInput ||
            parseInt(baseRateInput) <= 0 ||
            parseInt(baseRateInput) > 1000
          }
          label="Set Base Rate"
        />
      </Section>

      {/* Set Rate Limits */}
      <Section title="APY Limits">
        <p className="text-[10px] text-zinc-600 font-mono mb-4">
          Min and max APY bounds. APY never goes below min or above max
          regardless of TVL. Constraint: min &lt; max.
        </p>
        <div className="space-y-3">
          <InputRow
            label="Min APY"
            hint={`current: ${minRate?.toString() ?? "—"}%`}
            value={minRateInput}
            onChange={setMinRateInput}
            unit="%"
            placeholder={minRate?.toString() ?? "5"}
          />
          <InputRow
            label="Max APY"
            hint={`current: ${maxRate?.toString() ?? "—"}%`}
            value={maxRateInput}
            onChange={setMaxRateInput}
            unit="%"
            placeholder={maxRate?.toString() ?? "100"}
          />
        </div>
        <TxButton
          onClick={handleSetRateLimits}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          disabled={
            !minRateInput ||
            !maxRateInput ||
            parseInt(minRateInput) <= 0 ||
            parseInt(minRateInput) >= parseInt(maxRateInput)
          }
          label="Set Rate Limits"
        />
      </Section>
    </div>
  );
}

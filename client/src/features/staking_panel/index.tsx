import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { CONTRACT_ADDRESSES } from "@/config/addresses";
import { PersanalStats } from "./persanal_stats";

import { StakingActions } from "./staking_actions";
import { StakeInput } from "./stake_input";

export function StakingPanel() {
  const { address } = useAccount();

  const stakingAddress = CONTRACT_ADDRESSES[31337].LIQUIDITY_STAKING;

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync } = useWriteContract();

  const { isLoading: txLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: myStake, refetch: refetchStake } = useReadContract({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    functionName: "getMyStake",
    account: address,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    functionName: "getMyPendingRewards",
    account: address,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const stakedAmount = myStake?.[0] ?? 0n;
  const pending = pendingRewards ?? 0n;

  async function handleClaim() {
    const hash = await writeContractAsync({
      address: stakingAddress,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "claimRewards",
    });

    setTxHash(hash);
    await refetchRewards();
  }

  async function handleUnstake() {
    const hash = await writeContractAsync({
      address: stakingAddress,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "unstake",
    });

    setTxHash(hash);
    await refetchStake();
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          My Position
        </p>
      </div>

      <PersanalStats stakedAmount={stakedAmount} pending={pending} />

      <StakeInput
        refetchStake={refetchStake}
        txLoading={txLoading}
        setTxHash={setTxHash}
      />

      <StakingActions
        onClaim={handleClaim}
        onUnstake={handleUnstake}
        txLoading={txLoading}
        pending={pending}
        stakedAmount={stakedAmount}
      />

      {txLoading && (
        <p className="text-xs text-zinc-500 mt-4 font-mono animate-pulse">
          Transaction pending...
        </p>
      )}
    </div>
  );
}

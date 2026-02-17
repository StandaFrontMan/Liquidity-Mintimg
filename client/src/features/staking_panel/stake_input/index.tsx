import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { parseEther, type ReadContractErrorType } from "viem";
import { useChainId, useWriteContract } from "wagmi";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";

type Props = {
  refetchStake: (
    options?: RefetchOptions | undefined,
  ) => Promise<
    QueryObserverResult<
      readonly [amount: bigint, startTime: bigint, bigint],
      ReadContractErrorType
    >
  >;

  txLoading: boolean;
  setTxHash: React.Dispatch<React.SetStateAction<`0x${string}` | undefined>>;
};

export function StakeInput({ refetchStake, txLoading, setTxHash }: Props) {
  const [amount, setAmount] = useState("");

  const { writeContractAsync } = useWriteContract();

  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const stakingAddress = addresses?.LIQUIDITY_STAKING;

  async function handleStake() {
    if (!amount || Number(amount) <= 0) return;

    const hash = await writeContractAsync({
      address: stakingAddress,
      abi: LIQIUDITY_STAKING_ABI,
      functionName: "stake",
      value: parseEther(amount),
    });

    setTxHash(hash);
    setAmount("");
    await refetchStake();
  }

  return (
    <div className="flex gap-3 mb-4">
      <Input
        type="number"
        placeholder="0.0 ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="
            flex-1
            bg-zinc-800
            border border-zinc-700
            rounded-xl
            px-3 py-2
            text-sm
            outline-none
            focus:border-green-500
          "
      />

      <Button
        onClick={handleStake}
        disabled={txLoading}
        className="
            px-4
            py-2
            rounded-xl
            bg-green-500/20
            border border-green-500/30
            text-green-400
            text-sm
            hover:bg-green-500/30
            transition
          "
      >
        Stake
      </Button>
    </div>
  );
}

import { formatEther } from "viem";

export function PersanalStats({
  stakedAmount,
  pending,
}: {
  stakedAmount: bigint;
  pending: bigint;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
        <p className="text-xs text-zinc-500 mb-1">Staked</p>
        <p className="text-sm font-semibold text-green-400">
          {formatEther(stakedAmount)} ETH
        </p>
      </div>

      <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
        <p className="text-xs text-zinc-500 mb-1">Pending Rewards</p>
        <p className="text-sm font-semibold text-green-400">
          {formatEther(pending)} REW
        </p>
      </div>
    </div>
  );
}

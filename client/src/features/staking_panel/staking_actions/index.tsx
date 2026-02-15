import { Button } from "@/components/ui/button";

type Props = {
  onClaim: () => void;
  onUnstake: () => void;
  txLoading: boolean;
  pending: bigint;
  stakedAmount: bigint;
};

export function StakingActions({
  onClaim,
  onUnstake,
  txLoading,
  pending,
  stakedAmount,
}: Props) {
  return (
    <div className="space-y-3 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Claim */}
        <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-200">Claim Rewards</p>
            <p className="text-xs text-zinc-500">
              Withdraw accumulated staking rewards without touching your stake.
            </p>
          </div>

          <Button
            onClick={onClaim}
            disabled={txLoading || pending === 0n}
            className="
              w-full
              bg-green-500/15
              border border-green-500/30
              text-green-400
              hover:bg-green-500/25
              transition
            "
          >
            Claim
          </Button>
        </div>

        {/* Unstake */}
        <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-200">Unstake</p>
            <p className="text-xs text-zinc-500">
              Withdraw your full staked balance and stop earning rewards.
            </p>
          </div>

          <Button
            onClick={onUnstake}
            disabled={txLoading || stakedAmount === 0n}
            className="
              w-full
              bg-red-500/15
              border border-red-500/30
              text-red-400
              hover:bg-red-500/25
              transition
            "
          >
            Unstake
          </Button>
        </div>
      </div>
    </div>
  );
}

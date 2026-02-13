import { StakingPanel } from "../staking_panel";
import { ConnectionHeader } from "./header";
import { PoolStats } from "./pool_stats";

export const Connection = () => {
  return (
    <div className="grid grid-cols-[360px_1fr] gap-6">
      <StakingPanel />

      <div className="flex flex-col gap-6">
        <ConnectionHeader />
        <PoolStats />
      </div>
    </div>
  );
};

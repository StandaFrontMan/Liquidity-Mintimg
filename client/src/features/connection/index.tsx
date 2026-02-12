import { ConnectionHeader } from "./header";
import { PoolStats } from "./pool_stats";

export const Connection = () => {
  return (
    <div className="flex flex-col gap-5">
      <ConnectionHeader />

      <PoolStats />
    </div>
  );
};

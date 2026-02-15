import { Connection, WalletOptions } from "@/features";
import { useConnection } from "wagmi";

export default function Stake() {
  const { isConnected } = useConnection();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        {isConnected ? <Connection /> : <WalletOptions />}
      </div>
    </div>
  );
}

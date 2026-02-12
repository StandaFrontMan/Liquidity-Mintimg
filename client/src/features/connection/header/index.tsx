import { NetworkBadge } from "@/entities";
import { shortAddress } from "@/lib/utils";
import { useChainId, useConnection, useDisconnect } from "wagmi";

export function ConnectionHeader() {
  const { address } = useConnection();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-lg">
            ⬡
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">
              LIQUID<span className="text-green-400">STAKE</span>
            </p>

            <NetworkBadge chainId={chainId} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-zinc-300">
              {address ? shortAddress(address) : "—"}
            </span>
          </div>

          <button
            onClick={() => disconnect()}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-500 border border-zinc-700 hover:border-red-500/40 hover:text-red-400 transition-colors duration-150"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

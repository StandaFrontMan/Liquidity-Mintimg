import { useConnect, useConnectors } from "wagmi";
import { WalletOption } from "./ui/wallet-option";

export const WalletOptions = () => {
  const { connect } = useConnect();
  const connectors = useConnectors();

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 glow-green">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-glow">
          Connect Wallet
        </h1>

        <p className="text-sm text-zinc-400 mt-2">
          Connect to interact with the staking protocol
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {connectors.map((connector) => (
          <WalletOption
            key={connector.uid}
            connector={connector}
            handleClick={() => connect({ connector })}
          />
        ))}
      </div>
    </div>
  );
};

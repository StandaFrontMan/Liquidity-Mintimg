import { useConnect, useConnectors } from "wagmi";
import { WalletOption } from "./ui/wallet-option";

export const WalletOptions = () => {
  const { connect } = useConnect();
  const connectors = useConnectors();

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      handleClick={() => connect({ connector })}
    />
  ));
};

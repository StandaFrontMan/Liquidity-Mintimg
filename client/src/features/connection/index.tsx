import { Button } from "@/components/ui/button";
import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export const Connection = () => {
  const { address } = useConnection();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <Button onClick={() => disconnect()}>Disconnect</Button>
    </div>
  );
};

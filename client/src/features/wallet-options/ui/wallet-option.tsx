import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { type Connector } from "wagmi";

export const WalletOption = ({
  connector,
  handleClick,
}: {
  connector: Connector;
  handleClick: () => void;
}) => {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <Button disabled={!ready} onClick={handleClick}>
      {connector.name}
    </Button>
  );
};

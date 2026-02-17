import { createConfig, createStorage, http } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [hardhat, sepolia],
  connectors: [metaMask(), injected()],
  storage: createStorage({ storage: window.localStorage }),
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

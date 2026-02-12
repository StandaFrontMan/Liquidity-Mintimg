import { createConfig, createStorage, http } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";
import { anvilLocal } from "./chains";

export const config = createConfig({
  chains: [hardhat, sepolia, anvilLocal],
  connectors: [metaMask(), injected()],
  storage: createStorage({ storage: window.localStorage }),
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"), // Anvil
    [sepolia.id]: http(), // Sepolia
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

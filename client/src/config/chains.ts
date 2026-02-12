import { type Chain } from "viem";

export const anvilLocal = {
  id: 31337,
  name: "Anvil Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: {
      name: "None",
      url: "http://localhost:8545",
    },
  },
  testnet: true,
} as const satisfies Chain;

// Обновлять после каждого деплоя!
export const CONTRACT_ADDRESSES = {
  // Anvil (локальная сеть)
  // Адреса детерминированы — всегда одинаковые при чистом Anvil
  31337: {
    LIQUIDITY_STAKING:
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as `0x${string}`,
    REWARD_TOKEN: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`,
  },
  // Sepolia testnet — заполнить после деплоя
  11155111: {
    LIQUIDITY_STAKING: "" as `0x${string}`,
    REWARD_TOKEN: "" as `0x${string}`,
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

export const SUPPORTED_CHAINS = Object.keys(CONTRACT_ADDRESSES).map(
  Number,
) as SupportedChainId[];

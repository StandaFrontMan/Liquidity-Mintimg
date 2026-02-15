import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}···${addr.slice(-4)}`;
}

export function formatTVL(wei: bigint) {
  const eth = parseFloat(formatEther(wei));
  if (eth === 0) return "0.00";
  if (eth < 0.01) return "<0.01";
  return eth.toFixed(2);
}

export function formatBalance(wei: bigint) {
  const val = Number(wei) / 1e18;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toFixed(0);
}

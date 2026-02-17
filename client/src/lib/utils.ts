import { PRECISION, SECONDS_PER_YEAR } from "@/config/constats";
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

export function fmtEth(wei: bigint, d = 2) {
  return parseFloat(formatEther(wei)).toFixed(d);
}

export function fmtTokens(wei: bigint) {
  const n = Number(wei) / 1e18;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function fmtTime(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function toEth(wei: bigint) {
  return parseFloat(parseFloat(formatEther(wei)).toFixed(4));
}

export function calcReward(
  amountEth: number,
  apy: number,
  durationDays: number,
): number {
  // reward = amount * time * rate / PRECISION
  // rate   = PRECISION * APY / (100 * SECONDS_PER_YEAR)
  const rate = (PRECISION * apy) / (100 * SECONDS_PER_YEAR);
  const durationSec = durationDays * 24 * 60 * 60;
  const amountWei = amountEth * PRECISION;
  const reward = (amountWei * durationSec * rate) / PRECISION / PRECISION;
  return reward;
}

export function fmtReward(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return "<0.0001";
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2);
}

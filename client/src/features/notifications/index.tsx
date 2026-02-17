import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/config/addresses";
import { toast } from "sonner";
import { formatEther } from "viem";
import { useChainId, useWatchContractEvent, useAccount } from "wagmi";

export function Notifications() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  const stakingAddress = addresses?.LIQUIDITY_STAKING;

  useWatchContractEvent({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    eventName: "Staked",
    onLogs(logs) {
      logs.forEach((log) => {
        const { stakerAddress, amount } = log.args;
        if (stakerAddress === address) {
          toast.success("Stake Successful! 💰", {
            description: `${formatEther(amount!)} ETH staked`,
            duration: 5000,
          });
        }
      });
    },
  });

  useWatchContractEvent({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    eventName: "Claimed",
    onLogs(logs) {
      logs.forEach((log) => {
        const { claimedAddress, amount } = log.args;
        if (claimedAddress === address) {
          toast.success("Rewards Claimed! 🎉", {
            description: `${formatEther(amount!)} tokens claimed`,
            duration: 5000,
          });
        }
      });
    },
  });

  useWatchContractEvent({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    eventName: "Unstaked",
    onLogs(logs) {
      logs.forEach((log) => {
        const { unstakedAddress, ethAmount, rewardAmount } = log.args;
        if (unstakedAddress === address) {
          toast.success("Unstaked Successfully! 📤", {
            description: `${formatEther(ethAmount!)} ETH + ${formatEther(rewardAmount!)} rewards`,
            duration: 5000,
          });
        }
      });
    },
  });

  useWatchContractEvent({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    eventName: "APYUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        const { curApy, totalStaked } = log.args;
        toast.info("APY Updated 📊", {
          description: `Current APY: ${curApy}% | TVL: ${formatEther(totalStaked!)} ETH`,
          duration: 4000,
        });
      });
    },
  });

  return null;
}

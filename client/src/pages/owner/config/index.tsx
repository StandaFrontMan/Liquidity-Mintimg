import { Navigate, Outlet } from "react-router-dom";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/config/addresses";
import { LIQIUDITY_STAKING_ABI } from "@/config/abis";
import { ROUTES } from "@/config/routes";

export function OwnerRoute() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const stakingAddress =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
      ?.LIQUIDITY_STAKING;

  const { data: contractOwner, isLoading } = useReadContract({
    address: stakingAddress,
    abi: LIQIUDITY_STAKING_ABI,
    functionName: "owner",
    query: { enabled: !!stakingAddress },
  });

  if (!isConnected) {
    return <Navigate to={ROUTES.STAKE} replace />;
  }

  if (isLoading) {
    return null;
  }

  if (!contractOwner || contractOwner !== address) {
    return <Navigate to={ROUTES.STAKE} replace />;
  }

  return <Outlet />;
}

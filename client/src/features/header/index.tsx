import { Link, useLocation } from "react-router-dom";
import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";

import {
  Home,
  Trophy,
  Calculator,
  Settings,
  LineChart,
  Activity,
} from "lucide-react";
import { WalletOption } from "../wallet-options/ui/wallet-option";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";

export function Header() {
  const location = useLocation();
  const { isConnected } = useConnection();

  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();

  const navItems = [
    { path: "/", label: "Stake", icon: Home },
    { path: "/charts", label: "Charts", icon: LineChart },
    { path: "/analytics", label: "Analytics", icon: Activity },
    { path: "/calculator", label: "Calculator", icon: Calculator },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/owner", label: "Admin", icon: Settings, ownerOnly: true },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ξ</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">
              LiquidStake
            </span>
          </Link>

          {isConnected && (
            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {isConnected ? (
              <Button
                onClick={() => disconnect()}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-500 border border-zinc-700 hover:border-red-500/40 hover:text-red-400 transition-colors duration-150"
              >
                Disconnect
              </Button>
            ) : (
              <Fragment>
                {connectors.map((connector) => (
                  <WalletOption
                    key={connector.uid}
                    connector={connector}
                    handleClick={() => connect({ connector })}
                  />
                ))}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

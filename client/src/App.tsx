import { useConnection } from "wagmi";
import "./App.css";
import { Connection, WalletOptions } from "./features";

function App() {
  const { isConnected } = useConnection();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 font-mono px-4">
      <div className="w-full max-w-md">
        {isConnected ? <Connection /> : <WalletOptions />}
      </div>
    </div>
  );
}

export default App;

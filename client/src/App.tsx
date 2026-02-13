import { useConnection } from "wagmi";
import "./App.css";
import { Connection, WalletOptions } from "./features";
import { Header } from "./features/header";

function App() {
  const { isConnected } = useConnection();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <Header />

      <main className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {isConnected ? <Connection /> : <WalletOptions />}
        </div>
      </main>
    </div>
  );
}

export default App;

import { useConnection } from "wagmi";
import "./App.css";
import { Connection, WalletOptions } from "./features";

function App() {
  const { isConnected } = useConnection();
  if (isConnected) return <Connection />;
  return <WalletOptions />;
}

export default App;

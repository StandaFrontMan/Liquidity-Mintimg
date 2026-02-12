import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WagmiProvider } from "wagmi";
import { config } from "./config/wagmi.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const query = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={query}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);

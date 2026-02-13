import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WagmiProvider } from "wagmi";
import { config } from "./config/wagmi.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "./features/index.ts";
import { Toaster } from "sonner";

const query = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={query}>
        <App />

        <Notifications />
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);

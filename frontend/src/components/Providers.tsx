"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CFG, MOCK } from "@/lib/config";
import { monadTestnet } from "@/lib/chain";
import { MockSessionProvider, PrivySessionProvider } from "@/lib/session";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 2000, retry: 1 } } })
  );

  // Removed MOCK block so Privy is always used for login

  return (
    <PrivyProvider
      appId={CFG.privyAppId}
      config={{
        loginMethods: ["google", "wallet"],
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: true,
        },
        appearance: { theme: "dark", accentColor: "#f6c21c" },
      }}
    >
      <QueryClientProvider client={qc}>
        <PrivySessionProvider>{children}</PrivySessionProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
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

  if (MOCK) {
    return (
      <QueryClientProvider client={qc}>
        <MockSessionProvider>{children}</MockSessionProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={CFG.privyAppId}
      config={{
        loginMethods: ["google", "discord", "twitter", "github"],
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: false, // tanpa pop-up konfirmasi saat deposit
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
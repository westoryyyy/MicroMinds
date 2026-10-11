"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CFG, MOCK } from "@/lib/config";
import { monadTestnet } from "@/lib/chain";
import { MockSessionProvider, PrivySessionProvider } from "@/lib/session";
import { useTheme } from "./ThemeProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [qc] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 2000, retry: 1 } } })
  );

  // Fallback to mock session if Privy app ID is not configured (e.g. during build / local demo)
  if (!CFG.privyAppId) {
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
        loginMethods: ["google", "wallet"],
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: true,
        },
        appearance: { theme: theme === "dark" ? "dark" : "light", accentColor: "#f6c21c" },
      }}
    >
      <QueryClientProvider client={qc}>
        <PrivySessionProvider>{children}</PrivySessionProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
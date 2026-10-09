"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { MOCK } from "./config";

export type Session = {
  ready: boolean;
  authenticated: boolean;
  address?: `0x${string}`;
  login: () => void;
  logout: () => void;
  /** Mengambil getAccessToken dari Privy (untuk POST /api-keys). Mock: token palsu. */
  getToken: () => Promise<string | null>;
  /** EIP-1193 provider dari embedded wallet (untuk viem createWalletClient). */
  getProvider: () => Promise<any | null>;
};

/* ---------- Mock ---------- */
const MockCtx = createContext<Session | null>(null);
const MOCK_ADDR = "0x1111111111111111111111111111111111111111" as const;

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  const value: Session = {
    ready: true,
    authenticated: on,
    address: on ? MOCK_ADDR : undefined,
    login: () => setOn(true),
    logout: () => setOn(false),
    getToken: async () => (on ? "mock-token" : null),
    getProvider: async () => null,
  };
  return <MockCtx.Provider value={value}>{children}</MockCtx.Provider>;
}

/* ---------- Privy ---------- */
const PrivyCtx = createContext<Session | null>(null);

export function PrivySessionProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const embedded =
    wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];

  const value: Session = {
    ready,
    authenticated,
    address: embedded?.address as `0x${string}` | undefined,
    login,
    logout,
    getToken: getAccessToken,
    getProvider: async () => {
      if (!embedded) return null;
      await embedded.switchChain(10143); // pastikan di Monad testnet
      return embedded.getEthereumProvider();
    },
  };
  return <PrivyCtx.Provider value={value}>{children}</PrivyCtx.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(MOCK ? MockCtx : PrivyCtx);
  if (!ctx) throw new Error("useSession harus di dalam <Providers>");
  return ctx;
}
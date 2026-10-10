"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./session";
import { MOCK } from "./config";
import * as api from "./api";
import * as escrow from "./escrow";
import { fetchCalls } from "./envio";
import type { Hex } from "./types";

export const useListings = (p: { q?: string; maxPrice?: string }) =>
  useQuery({ queryKey: ["listings", p], queryFn: () => api.getListings(p) });

export const useListing = (id: string) =>
  useQuery({ queryKey: ["listing", id], queryFn: () => api.getListing(id), retry: false });

export function useBalance() {
  const { address } = useSession();
  return useQuery({
    queryKey: ["balance", address], enabled: !!address,
    queryFn: () => escrow.readBalance(address!), refetchInterval: 4000,
  });
}

export function useCalls(role: "consumer" | "provider") {
  const { address } = useSession();
  return useQuery({
    queryKey: ["calls", role, address], enabled: !!address,
    queryFn: () => fetchCalls(address!, role),
    refetchInterval: (q) => (q.state.error ? false : 4000), // stop polling if error
    retry: false, // jangan retry berkali-kali jika server mati
  });
}

/** API key disimpan per alamat di localStorage (hanya muncul sekali dari backend). */
export function useApiKey() {
  const { address } = useSession();
  const k = `mm_key_${address?.toLowerCase()}`;
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    try { setKey(address ? localStorage.getItem(k) : null); } catch { setKey(null); }
  }, [address, k]);
  const save = (v: string) => { setKey(v); try { localStorage.setItem(k, v); } catch {} };
  return { key, save };
}

function useRefresh() {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: ["balance"] }); qc.invalidateQueries({ queryKey: ["calls"] }); };
}

export function useDeposit() {
  const s = useSession(), refresh = useRefresh();
  return useMutation({ 
    mutationFn: (wei: bigint) => escrow.deposit(s, wei), 
    onSuccess: refresh,
    onError: (e: any) => alert("Error Deposit: " + (e.message || String(e)))
  });
}
export function useWithdraw() {
  const s = useSession(), refresh = useRefresh();
  return useMutation({ 
    mutationFn: (wei: bigint) => escrow.withdraw(s, wei), 
    onSuccess: refresh,
    onError: (e: any) => alert("Error Withdraw: " + (e.message || String(e)))
  });
}
export function useForceRefund() {
  const s = useSession(), refresh = useRefresh();
  return useMutation({ 
    mutationFn: (callId: Hex) => escrow.forceRefund(s, callId), 
    onSuccess: refresh,
    onError: (e: any) => alert("Error Force Refund: " + (e.message || String(e)))
  });
}
export function useCallApi() {
  const { address } = useSession(), { key } = useApiKey(), refresh = useRefresh();
  return useMutation({
    mutationFn: (v: { listingId: string; input: unknown }) => api.postCall(v.listingId, v.input, key, address),
    onSettled: refresh, // sukses maupun gagal, saldo bisa berubah
  });
}
export function useCreateApiKey() {
  const { getToken, address } = useSession(), { save } = useApiKey();
  return useMutation({
    mutationFn: async () => api.createApiKey(await getToken(), address ?? null),
    onSuccess: (k) => save(k),
  });
}

export function useCreateListing() {
  const { getToken } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<import("./types").Listing, "id" | "providerAddress">) => {
      const token = await getToken();
      return api.createListing(token, payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}
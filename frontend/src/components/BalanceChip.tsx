"use client";
import { useBalance } from "@/lib/hooks";
import { fmtMon } from "@/lib/format";

export default function BalanceChip() {
  const { data, isLoading, isError } = useBalance();
  return (
    <span className="chip"
      aria-live="polite" title="Saldo di Escrow">
      {isLoading ? "…" : isError ? "saldo ?" : `${fmtMon(data!)} tMON`}
    </span>
  );
}
"use client";
import { useBalance } from "@/lib/hooks";
import { fmtMon } from "@/lib/format";
import { useLang } from "@/components/LangProvider";

export default function BalanceChip() {
  const { data, isLoading, isError } = useBalance();
  const { t } = useLang();
  return (
    <span className="chip"
      aria-live="polite" title={t("Escrow Balance", "Saldo di Escrow")}>
      {isLoading ? "…" : isError ? t("balance ?", "saldo ?") : `${fmtMon(data!)} tMON`}
    </span>
  );
}
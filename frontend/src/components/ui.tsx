"use client";
import { txUrl, shortHash } from "@/lib/format";
import { MOCK } from "@/lib/config";
import { useLang } from "@/components/LangProvider";

export function Badge({ status }: { status: "released" | "refunded" | "force_refunded" | "reserved" | "failed" | string }) {
  const { t } = useLang();
  const MAP: Record<string, [string, string]> = {
    released: ["rel", t("Released", "Selesai")],
    refunded: ["ref", t("Refunded", "Dikembalikan")],
    force_refunded: ["ref", t("Force refunded", "Refund paksa")],
    reserved: ["hold", t("In Escrow", "Ditahan Escrow")],
    failed: ["ref", t("Failed", "Gagal")],
  };
  const [cls, label] = MAP[status] || ["ref", status];
  return <span className={`bdg ${cls}`}>{label}</span>;
}

export function TxLink({ hash }: { hash?: string }) {
  const { t } = useLang();
  if (!hash) return <span className="mut">-</span>;
  return (
    <a href={txUrl(hash)} target="_blank" rel="noopener noreferrer"
      title={MOCK ? t("Simulated transaction (demo mode)", "Transaksi simulasi (mode demo)") : t("View on explorer", "Lihat di explorer")}>
      {shortHash(hash)}
    </a>
  );
}

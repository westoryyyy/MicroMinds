import { formatEther } from "viem";
import { CFG } from "./config";
import type { CallRecord } from "./types";

export const FORCE_REFUND_AFTER_SEC = 24 * 60 * 60; // = 1 days di kontrak

/** wei -> "0.0015" (maks 6 desimal, tanpa nol di belakang) */
export function fmtMon(wei?: bigint | string | null): string {
  if (wei === undefined || wei === null) return "0";
  const [i, f = ""] = formatEther(BigInt(wei)).split(".");
  const t = f.slice(0, 6).replace(/0+$/, "");
  return t ? `${i}.${t}` : i;
}

export function fmtIdr(wei: bigint | string): string {
  const v = Number(formatEther(BigInt(wei))) * CFG.idrRate;
  return "≈ Rp " + Math.round(v).toLocaleString("id-ID");
}

export const shortHash = (h?: string) => (h ? `${h.slice(0, 10)}…` : "-");
export const shortAddr = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "-");
export const txUrl = (h: string) => CFG.explorerTx + h;

/** Tombol Force Refund muncul hanya jika reserved > 24 jam. Kontrak tetap jadi penentu akhir. */
export function canForceRefund(c: CallRecord, nowSec = Math.floor(Date.now() / 1000)) {
  return c.status === "reserved" && nowSec > c.reservedAt + FORCE_REFUND_AFTER_SEC;
}

/** Contoh input awal untuk textarea, dibuat dari JSON schema listing */
export function exampleFromSchema(schema: any): unknown {
  if (!schema) return {};
  if (schema.example !== undefined) return schema.example;
  switch (schema.type) {
    case "object":
      return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([k, v]) => [k, exampleFromSchema(v)])
      );
    case "array": return [];
    case "number": case "integer": return 0;
    case "boolean": return false;
    default: return "";
  }
}
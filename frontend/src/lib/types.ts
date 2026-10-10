export type Hex = `0x${string}`;

export type Listing = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceWei: string; // wei sebagai string (bigint tidak bisa lewat JSON)
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  timeoutMs: number;
  providerAddress: Hex;
  endpoint?: string;
  successRate?: number; // 0-100, opsional (Lampiran F)
  avgLatencyMs?: number;
};

/** Hasil POST /call (SKPL 5.2) */
export type CallResult = {
  callId: Hex;
  status: "released" | "refunded" | "failed";
  output?: unknown;
  txHash?: Hex;
  reason?: string;
  latencyMs?: number;
};

export type CallStatus = "reserved" | "released" | "refunded" | "force_refunded";

/** Satu baris riwayat (dari Envio) */
export type CallRecord = {
  callId: Hex;
  consumer: Hex;
  provider: Hex;
  amount: bigint;
  status: CallStatus;
  reservedAt: number; // detik (unix)
  finalizedAt?: number;
  reserveTx?: Hex;
  finalTx?: Hex;
  listingName?: string; // hanya ada di mock / jika backend memperkaya
};

export class ApiError extends Error {
  constructor(public code: string, message: string, public status = 0) {
    super(message);
    this.name = "ApiError";
  }
}
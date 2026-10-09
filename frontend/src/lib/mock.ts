import { parseEther } from "viem";
import { ApiError, type CallRecord, type CallResult, type Hex, type Listing } from "./types";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const hx = (n: number) =>
  ("0x" + Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("")) as Hex;

const PROVIDER = "0x2222222222222222222222222222222222222222" as Hex;
const ME = "0x1111111111111111111111111111111111111111" as Hex;
const wei = (s: string) => parseEther(s).toString();

export const MOCK_LISTINGS: Listing[] = [
  { id: "croc", name: "Croc's JSON Tidy", category: "Formatting",
    description: "Merapikan JSON berantakan menjadi JSON rapi.",
    priceWei: wei("0.001"), timeoutMs: 5000, providerAddress: PROVIDER, successRate: 97, avgLatencyMs: 240,
    inputSchema: { type: "object", properties: { raw: { type: "string", example: "{\"a\":1,\"b\":[2,3]}" } }, required: ["raw"] },
    outputSchema: { type: "object", properties: { formatted: { type: "string" } }, required: ["formatted"] } },
  { id: "bird", name: "Bird's Word Picker", category: "Text",
    description: "Mengambil kata, email, dan link dari teks apa pun.",
    priceWei: wei("0.002"), timeoutMs: 5000, providerAddress: PROVIDER, successRate: 99, avgLatencyMs: 310,
    inputSchema: { type: "object", properties: { text: { type: "string", example: "Mail hi@mimi.id or see https://monad.xyz" } }, required: ["text"] },
    outputSchema: { type: "object", properties: { words: { type: "number" }, emails: { type: "array" }, urls: { type: "array" } }, required: ["words", "emails", "urls"] } },
  { id: "frog", name: "Frog's Link Peek", category: "Web",
    description: "Mengambil metadata sebuah URL (judul dan host).",
    priceWei: wei("0.003"), timeoutMs: 5000, providerAddress: PROVIDER, successRate: 95, avgLatencyMs: 420,
    inputSchema: { type: "object", properties: { url: { type: "string", example: "https://monad.xyz/docs" } }, required: ["url"] },
    outputSchema: { type: "object", properties: { title: { type: "string" }, host: { type: "string" } }, required: ["title", "host"] } },
  { id: "bug", name: "Beetle's Wobbly Fortune", category: "Flaky demo",
    description: "Sengaja gagal (HTTP 500 atau schema salah) untuk memperlihatkan refund.",
    priceWei: wei("0.001"), timeoutMs: 5000, providerAddress: PROVIDER, successRate: 12, avgLatencyMs: 500,
    inputSchema: { type: "object", properties: { question: { type: "string", example: "Will it work?" } }, required: ["question"] },
    outputSchema: { type: "object", properties: { fortune: { type: "string" } }, required: ["fortune"] } },
];

const now = () => Math.floor(Date.now() / 1000);

export const mockDb = {
  balance: parseEther("0.05"),
  calls: [
    { callId: hx(64), consumer: ME, provider: PROVIDER, amount: parseEther("0.001"), status: "reserved",
      reservedAt: now() - 25 * 3600, reserveTx: hx(64), listingName: "Croc's JSON Tidy (macet 25 jam)" },
  ] as CallRecord[],
};

let flip = false;

export async function mockCall(listingId: string, input: any, consumer: Hex = ME): Promise<CallResult> {
  const l = MOCK_LISTINGS.find((x) => x.id === listingId);
  if (!l) throw new ApiError("LISTING_NOT_FOUND", "Listing tidak ditemukan.", 404);
  const price = BigInt(l.priceWei);
  if (mockDb.balance < price)
    throw new ApiError("INSUFFICIENT_BALANCE", "Saldo escrow tidak cukup. Deposit dulu.", 402);

  const callId = hx(64), reserveTx = hx(64), finalTx = hx(64), t0 = Date.now();
  await sleep(500);
  mockDb.balance -= price; // reserve
  await sleep(600 + Math.random() * 400); // provider

  let reason: string | undefined;
  let output: any;
  if (l.id === "bug") {
    flip = !flip;
    reason = flip ? "HTTP 500" : 'schema mismatch: missing "fortune"';
  } else if (l.id === "croc") {
    try { output = { formatted: JSON.stringify(JSON.parse(String(input?.raw)), null, 2) }; }
    catch { reason = "HTTP 422: input bukan JSON valid"; }
  } else if (l.id === "bird") {
    const t = String(input?.text ?? "");
    output = { words: t.split(/\s+/).filter(Boolean).length, emails: t.match(/[\w.]+@[\w.]+\w/g) ?? [], urls: t.match(/https?:\/\/\S+/g) ?? [] };
  } else {
    try { const u = new URL(String(input?.url)); output = { title: u.hostname + " (simulasi)", host: u.hostname }; }
    catch { reason = "HTTP 422: URL tidak valid"; }
  }
  await sleep(300); // validasi + release/refund

  const ok = !reason;
  if (!ok) mockDb.balance += price; // refund
  mockDb.calls.unshift({
    callId, consumer, provider: l.providerAddress, amount: price,
    status: ok ? "released" : "refunded", reservedAt: now(), finalizedAt: now(),
    reserveTx, finalTx, listingName: l.name,
  });
  return { callId, status: ok ? "released" : "refunded", output: ok ? output : undefined,
    txHash: finalTx, reason, latencyMs: Date.now() - t0 };
}
import { CFG, MOCK } from "./config";
import { ApiError, type CallResult, type Hex, type Listing } from "./types";
import { MOCK_LISTINGS, mockCall, mockDb, sleep } from "./mock";

const API_KEY_HEADER = "x-api-key";

async function req<T>(path: string, init: RequestInit = {}, headers: Record<string, string> = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(CFG.apiBase + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...headers },
    });
  } catch {
    throw new ApiError("NETWORK", "Tidak bisa menghubungi server. Cek koneksi atau coba lagi.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // format error seragam SKPL 5.2: { error: { code, message } }
    throw new ApiError(body?.error?.code ?? "HTTP_" + res.status, body?.error?.message ?? res.statusText, res.status);
  }
  return body as T;
}

export async function getListings(p: { q?: string; maxPrice?: string } = {}): Promise<Listing[]> {
  if (MOCK) {
    await sleep(350);
    const q = (p.q ?? "").toLowerCase();
    return MOCK_LISTINGS.filter(
      (l) => (!p.maxPrice || BigInt(l.priceWei) <= BigInt(p.maxPrice)) &&
        (l.name + l.description + l.category).toLowerCase().includes(q)
    );
  }
  const qs = new URLSearchParams();
  if (p.q) qs.set("q", p.q);
  if (p.maxPrice) qs.set("maxPrice", p.maxPrice); // wei
  return req<Listing[]>("/listings" + (qs.size ? "?" + qs : ""));
}

export async function getListing(id: string): Promise<Listing> {
  if (MOCK) {
    await sleep(250);
    const l = MOCK_LISTINGS.find((x) => x.id === id);
    if (!l) throw new ApiError("LISTING_NOT_FOUND", `Listing "${id}" tidak ada.`, 404);
    return l;
  }
  return req<Listing>("/listings/" + encodeURIComponent(id));
}

export async function postCall(listingId: string, input: unknown, apiKey: string | null, consumer?: Hex): Promise<CallResult> {
  if (MOCK) return mockCall(listingId, input, consumer);
  if (!apiKey) throw new ApiError("NO_API_KEY", "Buat API key dulu di Dashboard.");
  return req<CallResult>("/call", { method: "POST", body: JSON.stringify({ listingId, input }) }, { [API_KEY_HEADER]: apiKey });
}

export async function createApiKey(privyToken: string | null): Promise<string> {
  if (MOCK) { await sleep(400); return "mm_" + Math.random().toString(16).slice(2, 26); }
  if (!privyToken) throw new ApiError("NO_TOKEN", "Sesi login habis. Login ulang.");
  const r = await req<{ apiKey: string }>("/api-keys", { method: "POST" }, { Authorization: `Bearer ${privyToken}` });
  return r.apiKey;
}

export async function getMe(apiKey: string): Promise<{ address: Hex; balance: string }> {
  if (MOCK) return { address: "0x1111111111111111111111111111111111111111", balance: mockDb.balance.toString() };
  return req("/me", {}, { [API_KEY_HEADER]: apiKey });
}
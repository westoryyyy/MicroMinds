import { CFG, MOCK } from "./config";
import { ApiError, type CallRecord, type CallStatus, type Hex } from "./types";
import { mockDb, sleep } from "./mock";

const QUERY = /* GraphQL */ `
  query Calls($where: Call_bool_exp!) {
    Call(where: $where, order_by: { reservedAt: desc }, limit: 50) {
      id consumer provider amount status reservedAt finalizedAt reserveTx finalTx
    }
  }`;

const STATUSES: CallStatus[] = ["reserved", "released", "refunded", "force_refunded"];

function toRecord(r: any): CallRecord {
  const status = String(r.status).toLowerCase() as CallStatus;
  return {
    callId: r.id, consumer: r.consumer, provider: r.provider,
    amount: BigInt(String(r.amount)),
    status: STATUSES.includes(status) ? status : "reserved",
    reservedAt: Number(r.reservedAt),
    finalizedAt: r.finalizedAt ? Number(r.finalizedAt) : undefined,
    reserveTx: r.reserveTx ?? undefined, finalTx: r.finalTx ?? undefined,
  };
}

/** role "consumer": panggilan yang kubayar. role "provider": panggilan yang kuterima. */
export async function fetchCalls(address: Hex, role: "consumer" | "provider"): Promise<CallRecord[]> {
  if (MOCK) {
    await sleep(250);
    return mockDb.calls.filter((c) => (role === "consumer" ? c.consumer : c.provider).toLowerCase() === address.toLowerCase());
  }
  if (!CFG.envioUrl) throw new ApiError("NO_ENVIO", "NEXT_PUBLIC_ENVIO_GRAPHQL_URL belum diisi.");
  let res: Response;
  try {
    res = await fetch(CFG.envioUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { where: { [role]: { _eq: address.toLowerCase() } } } }),
    });
  } catch { throw new ApiError("NETWORK", "Indexer tidak bisa dihubungi."); }
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.errors) throw new ApiError("ENVIO", json?.errors?.[0]?.message ?? "Indexer error.");
  return (json.data.Call as any[]).map(toRecord);
}
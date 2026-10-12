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

  // 1. Prioritaskan Backend API Gateway (Database PostgreSQL real-time dengan listingName & tx Monad)
  if (CFG.apiBase) {
    try {
      const res = await fetch(`${CFG.apiBase}/calls?address=${address.toLowerCase()}&role=${role}`, {
        headers: { "Accept": "application/json" },
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((r: any): CallRecord => {
            const rawStatus = String(r.status || "released").toLowerCase();
            const status: CallStatus = STATUSES.includes(rawStatus as CallStatus) 
              ? (rawStatus as CallStatus) 
              : "released";

            return {
              callId: r.callId as Hex,
              consumer: r.consumer as Hex,
              provider: r.provider as Hex,
              amount: BigInt(String(r.amountWei || r.amount || "0")),
              status,
              reservedAt: Number(r.reservedAt || Math.floor(new Date(r.createdAt || Date.now()).getTime() / 1000)),
              finalizedAt: r.finalizedAt ? Number(r.finalizedAt) : undefined,
              reserveTx: (r.reserveTx || r.txReserve) as Hex | undefined,
              finalTx: (r.finalTx || r.txFinal) as Hex | undefined,
              listingName: r.listingName || undefined,
            };
          });
        }
      }
    } catch (err) {
      console.warn("Backend /calls query error, attempting Envio fallback:", err);
    }
  }

  // 2. Fallback ke Envio GraphQL Indexer (jika dikonfigurasi & backend kosong)
  if (CFG.envioUrl) {
    try {
      const res = await fetch(CFG.envioUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: QUERY, variables: { where: { [role]: { _eq: address.toLowerCase() } } } }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.data?.Call && Array.isArray(json.data.Call)) {
          return (json.data.Call as any[]).map(toRecord);
        }
      }
    } catch (err) {
      console.warn("Envio indexer query error:", err);
    }
  }

  return [];
}
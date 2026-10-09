"use client";
import { parseEther } from "viem";
import { useSession } from "@/lib/session";
import { useBalance, useCalls, useCallApi, useDeposit, useForceRefund, useListings, useWithdraw } from "@/lib/hooks";
import { canForceRefund, fmtMon } from "@/lib/format";

export default function Dev() {
  const { authenticated } = useSession();
  const bal = useBalance(), listings = useListings({}), calls = useCalls("consumer");
  const dep = useDeposit(), wd = useWithdraw(), fr = useForceRefund(), call = useCallApi();
  const err = dep.error ?? wd.error ?? fr.error ?? call.error;
  if (!authenticated) return <p className="p-6">Login dulu.</p>;
  return (
    <div className="mx-auto max-w-[1080px] space-y-3 p-6">
      <p>Saldo: <b>{bal.data !== undefined ? fmtMon(bal.data) : "…"}</b> tMON</p>
      <div className="flex flex-wrap gap-2">
        <button className="border-2 px-3" onClick={() => dep.mutate(parseEther("0.01"))}>Deposit 0.01</button>
        <button className="border-2 px-3" onClick={() => wd.mutate(parseEther("0.005"))}>Withdraw 0.005</button>
        <button className="border-2 px-3" disabled={!listings.data?.length}
          onClick={() => call.mutate({ listingId: listings.data![0].id, input: { raw: "{\"a\":1}" } })}>
          Call listing pertama
        </button>
      </div>
      {err && <p className="text-brand-red">Error: {(err as Error).message}</p>}
      {call.data && <pre className="text-sm">{JSON.stringify(call.data, null, 2)}</pre>}
      <h2 className="font-display text-2xl">Listing ({listings.data?.length ?? 0})</h2>
      <ul>{listings.data?.map((l) => <li key={l.id}>{l.name}: {fmtMon(l.priceWei)} tMON</li>)}</ul>
      <h2 className="font-display text-2xl">Riwayat</h2>
      <ul>{calls.data?.map((c) => (
        <li key={c.callId}>{c.listingName ?? c.callId.slice(0, 10)} · {c.status} · {fmtMon(c.amount)}
          {canForceRefund(c) && <button className="ml-2 border-2 px-2" onClick={() => fr.mutate(c.callId)}>Force Refund</button>}
        </li>))}
      </ul>
    </div>
  );
}
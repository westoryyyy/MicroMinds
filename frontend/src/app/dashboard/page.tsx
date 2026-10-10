"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/session";
import { useBalance, useCalls, useApiKey, useCreateApiKey, useDeposit, useWithdraw, useForceRefund } from "@/lib/hooks";
import { fmtMon, fmtIdr, txUrl, shortHash, canForceRefund } from "@/lib/format";
import { Sv } from "@/components/Crayon";
import { Badge, TxLink } from "@/components/ui";

export default function DashboardPage() {
  const { authenticated, login, address } = useSession();
  const [tab, setTab] = useState<"c" | "p">("c");

  const { data: bal = 0n } = useBalance();
  const { data: calls = [], isLoading: callsLoading } = useCalls(tab === "c" ? "consumer" : "provider");
  const { key } = useApiKey();
  const createKey = useCreateApiKey();
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const forceRefund = useForceRefund();

  const [amt, setAmt] = useState("0.05");
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Hitung hold berdasarkan panggilan yang masih 'reserved'
  const heldByCat = calls.filter(c => c.status === "reserved").reduce((sum, c) => sum + c.amount, 0n);

  const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const int = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 10000);
    return () => clearInterval(int);
  }, []);

  if (!authenticated) {
    return (
      <div className="wrap py-24">
        <section className="card flex flex-col items-center justify-center text-center py-16 gap-6 max-w-2xl mx-auto">
          <Sv id="cat" w={140} />
          <h2 className="text-4xl md:text-5xl m-0">Log in to open your dashboard</h2>
          <p className="text-xl text-mut m-0">Your embedded wallet and balance appear here.</p>
          <button className="btn b-b !text-2xl mt-4 !px-8 !py-3" onClick={login}>Log in with Privy</button>
        </section>
      </div>
    );
  }

  const handleDeposit = () => {
    const v = parseFloat(amt.replace(",", "."));
    if (v > 0) deposit.mutate(BigInt(Math.round(v * 1e18)));
  };

  const handleWithdraw = () => {
    const v = parseFloat(amt.replace(",", "."));
    if (v > 0) withdraw.mutate(BigInt(Math.round(v * 1e18)));
  };

  return (
    <>
      <header className="wrap py-12 md:py-16 border-b-[3px] border-dashed border-mut">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div>
            <h1 className="text-5xl md:text-6xl mb-2">Dashboard</h1>
            <div className="flex flex-wrap items-center gap-3 text-lg text-mut font-sans">
              <span>Wallet:</span>
              <button 
                onClick={handleCopy}
                className="bg-ink text-paper px-3 py-1 rounded-[8px_2px_8px_2px] hover:bg-[#3a3a5a] transition-colors flex items-center gap-2 cursor-pointer border-none font-mono text-sm"
                title="Click to copy"
              >
                {address} <span className="text-base">{copied ? "✅" : "📋"}</span>
              </button>
              <span className="opacity-50">·</span>
              <span>Monad Testnet</span>
            </div>
          </div>
          
          <div className="flex bg-paper border-[3px] border-solid border-ink p-1 rounded-[20px_6px_20px_6px] shadow-sm">
            <button 
              className={`px-6 py-2 text-xl font-gochi border-none cursor-pointer rounded-[14px_4px_14px_4px] transition-colors ${tab === "c" ? "bg-yel text-ink border-[2px] border-solid border-ink shadow-sm" : "bg-transparent text-mut"}`}
              onClick={() => setTab("c")}
            >
              Consumer
            </button>
            <button 
              className={`px-6 py-2 text-xl font-gochi border-none cursor-pointer rounded-[14px_4px_14px_4px] transition-colors ${tab === "p" ? "bg-yel text-ink border-[2px] border-solid border-ink shadow-sm" : "bg-transparent text-mut"}`}
              onClick={() => setTab("p")}
            >
              Provider
            </button>
          </div>
        </div>
      </header>

      <main className="wrap py-12 flex flex-col gap-16">
        {tab === "c" && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="card flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sv id="cat" w={150} />
                </div>
                <h3 className="text-2xl m-0 relative z-10">Balance</h3>
                <p className="text-5xl font-gochi text-grn m-0 leading-none mt-2 relative z-10 break-all">{fmtMon(bal)} tMON</p>
                <div className="mt-auto pt-6 relative z-10">
                  <p className="text-mut text-sm font-sans m-0">Held by cat: <b>{fmtMon(heldByCat)}</b></p>
                  <p className="text-mut text-sm font-sans m-0">Est. {fmtIdr(bal)}</p>
                </div>
              </div>

              <div className="card flex flex-col gap-4">
                <h3 className="text-2xl m-0">Deposit / Withdraw</h3>
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="w-full relative">
                    <input
                      type="number"
                      step=".001"
                      min="0"
                      value={amt}
                      onChange={(e) => setAmt(e.target.value)}
                      className="w-full !py-3 !text-xl !pr-16 font-mono text-ink text-center"
                      aria-label="Amount"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mut font-sans text-sm font-bold">tMON</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <button className="btn b-g !text-lg !py-2 !px-2 w-full text-center whitespace-nowrap" onClick={handleDeposit} disabled={deposit.isPending}>
                      Deposit
                    </button>
                    <button className="btn !text-lg !py-2 !px-2 w-full text-center whitespace-nowrap" onClick={handleWithdraw} disabled={withdraw.isPending}>
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              <div className="card flex flex-col gap-3">
                <h3 className="text-2xl m-0">API Key</h3>
                <div className="bg-ink text-paper p-3 rounded-[8px_2px_8px_2px] overflow-x-auto min-h-[50px] flex items-center mt-2 shadow-inner">
                  {key ? (
                    <code className="text-sm text-grn break-all font-mono">{key}</code>
                  ) : (
                    <span className="text-mut text-sm font-sans">No key yet. It will be tied to your wallet.</span>
                  )}
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <button className="btn b-b !text-lg !py-2 !px-4 w-full" onClick={() => createKey.mutate()} disabled={createKey.isPending}>
                    {key ? "Regenerate Key" : "Create API Key"}
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-3xl mb-6">Call History</h3>
              {callsLoading ? (
                <div className="card flex justify-center py-12"><div className="sk w-1/2"></div></div>
              ) : calls.length > 0 ? (
                <div className="tw card !p-0 overflow-hidden">
                  <table className="w-full text-sm font-sans border-collapse">
                    <thead className="bg-paper text-ink font-gochi text-lg">
                      <tr>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Shop</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Price</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Status</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Latency</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Tx</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((c) => (
                        <tr key={c.callId} className="hover:bg-[#f9f9f9] transition-colors">
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-medium text-ink">{c.listingName || shortHash(c.provider)}</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-mono text-grn">{fmtMon(c.amount)}</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0]"><Badge status={c.status} /></td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] opacity-70">{c.finalizedAt ? `${(c.finalizedAt - c.reservedAt) * 1000}ms` : "-"}</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0]"><TxLink hash={c.finalTx || c.reserveTx} /></td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] text-right">
                            {canForceRefund(c, nowSec) ? (
                              <button
                                className="btn b-r !px-3 !py-1 !text-sm !font-sans !font-bold whitespace-nowrap"
                                onClick={() => forceRefund.mutate(c.callId)}
                                disabled={forceRefund.isPending}
                              >
                                Force Refund
                              </button>
                            ) : (
                              <span className="text-mut">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-16 gap-4">
                  <Sv id="monkey" w={100} />
                  <p className="text-xl text-mut">No calls yet.</p>
                  <Link href="/explore" className="btn b-g !text-xl !px-6 mt-2">Send Mimi to a shop</Link>
                </div>
              )}
            </section>
          </>
        )}

        {tab === "p" && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sv id="croc" w={180} />
                </div>
                <h3 className="text-2xl m-0 relative z-10">Earnings</h3>
                <p className="text-5xl font-gochi text-grn m-0 leading-none mt-2 relative z-10">{fmtMon(bal)} tMON</p>
                <div className="mt-auto pt-6 relative z-10">
                  <p className="text-mut text-sm font-sans m-0 mb-4">Earnings go directly to your balance.</p>
                  <button className="btn b-g !text-xl !w-full !py-3" onClick={() => setAmt(fmtMon(bal))}>
                    Max withdraw
                  </button>
                </div>
              </div>

              <div className="card flex flex-col gap-4">
                <h3 className="text-2xl m-0">Provider Guide</h3>
                <p className="text-lg text-mut m-0 leading-relaxed">
                  Want to host a tiny API? Add your listing to the backend and watch the calls come in.
                  The gateway will verify your schema automatically.
                </p>
                <div className="mt-auto pt-4">
                  <div className="bg-yel text-ink border-[3px] border-solid border-ink p-3 rounded-[12px_4px_12px_4px] text-center font-bold text-sm transform -rotate-1 shadow-sm">
                    Provider dashboard coming soon
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-3xl mb-6">Incoming Calls</h3>
              {callsLoading ? (
                <div className="card flex justify-center py-12"><div className="sk w-1/2"></div></div>
              ) : calls.length > 0 ? (
                <div className="tw card !p-0 overflow-hidden">
                  <table className="w-full text-sm font-sans border-collapse">
                    <thead className="bg-paper text-ink font-gochi text-lg">
                      <tr>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Consumer</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Earnings</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Status</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-right">Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((c) => (
                        <tr key={c.callId} className="hover:bg-[#f9f9f9] transition-colors">
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-medium text-ink">{shortHash(c.consumer)}</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-mono text-grn">{fmtMon(c.amount)}</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0]"><Badge status={c.status} /></td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] text-right"><TxLink hash={c.finalTx || c.reserveTx} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-16 gap-4">
                  <p className="text-xl text-mut m-0">No incoming calls yet.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

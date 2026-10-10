"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/session";
import { useBalance, useCalls, useApiKey, useCreateApiKey, useDeposit, useWithdraw, useForceRefund, useListings } from "@/lib/hooks";
import { fmtMon, fmtIdr, txUrl, shortHash, canForceRefund } from "@/lib/format";
import { Sv } from "@/components/Crayon";
import { Badge, TxLink } from "@/components/ui";
import CreateListingModal from "@/components/CreateListingModal";

export default function DashboardPage() {
  const { authenticated, login, address } = useSession();
  const [tab, setTab] = useState<"c" | "p">("c");

  const { data: bal = 0n } = useBalance();
  const { data: calls = [], isLoading: callsLoading } = useCalls(tab === "c" ? "consumer" : "provider");
  
  const { data: allListings = [] } = useListings({});
  const myListings = allListings.filter(l => l.providerAddress.toLowerCase() === address?.toLowerCase());

  const { key } = useApiKey();
  const createKey = useCreateApiKey();
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const forceRefund = useForceRefund();

  const [amt, setAmt] = useState("0.05");
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(key || "");
    alert("API Key copied to clipboard!");
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
    <div className={`min-h-screen transition-colors duration-500 ${tab === "p" ? "bg-[#3a46c835]" : "bg-paper"}`}>
      <style>{`
        footer {
          background-color: ${tab === "p" ? "#3a46c835" : "var(--paper)"};
          transition: background-color 500ms;
        }
      `}</style>
      <header className={`border-b-[3px] border-dashed border-mut transition-colors duration-500 ${tab === "p" ? "bg-paper" : "bg-[#3a46c835]"}`}>
        <div className="wrap py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 justify-between items-center text-center md:text-left">
            <div>
              <h1 className="text-5xl md:text-6xl mb-4">
                {tab === "c" ? "🛒 Consumer Mode" : "🏪 Provider Mode"}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-lg text-mut font-sans">
                <span>Wallet:</span>
                <button 
                  onClick={handleCopy}
                  className="bg-ink text-paper px-3 py-1 rounded-[8px_2px_8px_2px] hover:bg-[#3a3a5a] transition-colors flex items-center gap-2 cursor-pointer border-none font-mono text-sm"
                  title="Click to copy"
                >
                  {address} <span className="text-base">{copied ? "✅" : "📋"}</span>
                </button>
                <span className="opacity-50 hidden sm:inline">·</span>
                <span className="hidden sm:inline">Monad Testnet</span>
              </div>
            </div>
            
            <div className="flex bg-card border-[3px] border-solid border-ink p-1.5 rounded-[24px_8px_24px_8px] shadow-crayon shrink-0">
              <button 
                className={`px-6 md:px-8 py-3 text-2xl font-gochi border-none cursor-pointer rounded-[20px_6px_20px_6px] transition-all flex items-center gap-2 ${tab === "c" ? "bg-yel text-paper border-[3px] border-solid border-ink shadow-sm transform scale-[1.02]" : "bg-transparent text-mut hover:bg-black/5"}`}
                onClick={() => setTab("c")}
              >
                Consumer
              </button>
              <button 
                className={`px-6 md:px-8 py-3 text-2xl font-gochi border-none cursor-pointer rounded-[20px_6px_20px_6px] transition-all flex items-center gap-2 ${tab === "p" ? "bg-blu text-white border-[3px] border-solid border-ink shadow-sm transform scale-[1.02]" : "bg-transparent text-mut hover:bg-black/5"}`}
                onClick={() => setTab("p")}
              >
                Provider
              </button>
            </div>
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
                <div className="bg-ink text-paper p-3 rounded-[8px_2px_8px_2px] overflow-hidden min-h-[50px] flex items-center justify-between mt-2 shadow-inner">
                  {key ? (
                    <>
                      <code className="text-sm text-grn break-all font-mono">
                        {showKey ? key : "************************************"}
                      </code>
                      <div className="flex gap-2 shrink-0 ml-2">
                        <button className="bg-transparent border-none cursor-pointer text-paper opacity-70 hover:opacity-100 text-lg" onClick={() => setShowKey(!showKey)} title="Show/Hide">
                          {showKey ? "🙈" : "👁️"}
                        </button>
                        <button className="bg-transparent border-none cursor-pointer text-paper opacity-70 hover:opacity-100 text-lg" onClick={handleCopyKey} title="Copy Key">
                          📋
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-mut text-sm font-sans">No key yet. It will be tied to your wallet.</span>
                  )}
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <button 
                    className="btn b-b !text-lg !py-2 !px-4 w-full" 
                    onClick={() => {
                      if (key) {
                        if (window.confirm("Yakin? Aplikasi kamu yang pakai key lama akan langsung error!")) {
                          createKey.mutate();
                        }
                      } else {
                        createKey.mutate();
                      }
                    }} 
                    disabled={createKey.isPending}
                  >
                    {key ? "Regenerate Key" : "Create API Key"}
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-3xl mb-6 flex items-center gap-3">
                <span className="bg-ink text-paper w-10 h-10 rounded-full flex items-center justify-center font-bold font-sans text-xl shadow-sm rotate-2">📜</span>
                Riwayat Pemakaian
              </h3>
              {callsLoading ? (
                <div className="card flex justify-center py-12"><div className="sk w-1/2"></div></div>
              ) : calls.length > 0 ? (
                <div className="tw card !p-0 overflow-hidden">
                  <table className="w-full text-sm font-sans border-collapse">
                    <thead className="bg-paper text-ink font-gochi text-lg">
                      <tr>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Waktu</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Nama API</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Biaya</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Status</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((c) => (
                        <tr key={c.callId} className="hover:bg-[#f9f9f9] transition-colors">
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] opacity-70">
                            {new Date(Number(c.reservedAt) * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-medium text-ink">{c.listingName || shortHash(c.provider)}</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-mono text-red">-{fmtMon(c.amount)} tMON</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0]"><Badge status={c.status} /></td>
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
                              <TxLink hash={c.finalTx || c.reserveTx} />
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
                  <p className="text-xl text-mut">Belum ada pemakaian.</p>
                  <Link href="/explore" className="btn b-g !text-xl !px-6 mt-2">Cari API Sekarang</Link>
                </div>
              )}
            </section>
          </>
        )}

        {tab === "p" && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sv id="croc" w={180} />
                </div>
                <h3 className="text-2xl m-0 relative z-10">Total Pendapatan</h3>
                <p className="text-5xl font-gochi text-blu m-0 leading-none mt-2 relative z-10">{fmtMon(bal)} tMON</p>
                <div className="mt-auto pt-6 relative z-10">
                  <p className="text-mut text-sm font-sans m-0 mb-4">Pendapatan masuk otomatis ke saldo utama.</p>
                  <button className="btn b-b !text-xl !w-full !py-3" onClick={() => setAmt(fmtMon(bal))}>
                    Withdraw Semua
                  </button>
                </div>
              </div>

              <div onClick={() => setIsModalOpen(true)} className="card flex flex-col items-center justify-center gap-4 border-[3px] border-dashed border-mut bg-transparent shadow-none hover:bg-card hover:border-solid hover:border-ink transition-all cursor-pointer py-12 md:py-8">
                  <span className="text-5xl inline-block origin-bottom-right">➕</span>
                  <h3 className="text-2xl m-0 hover:text-blu transition-colors">Create New Listing</h3>
                  <p className="text-mut text-center font-sans m-0 px-4">Mulai jual API mikromu sekarang juga.</p>
              </div>
            </section>

            <section>
               <h3 className="text-3xl mb-6 flex items-center gap-3">
                  <span className="bg-blu text-white w-10 h-10 rounded-full flex items-center justify-center font-bold font-sans text-xl shadow-sm -rotate-2">🏪</span>
                  Toko / API Milikmu
               </h3>
               {myListings.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {myListings.map(l => (
                     <div key={l.id} className="card flex flex-col gap-3 relative overflow-hidden group">
                        <div className="flex justify-between items-start gap-4">
                           <h4 className="text-2xl m-0">{l.name}</h4>
                           <span className="bdg rel !bg-blu shrink-0">{l.category}</span>
                        </div>
                        <p className="text-mut text-sm font-sans line-clamp-2">{l.description}</p>
                        <div className="mt-auto pt-4 flex justify-between items-end border-t-2 border-dashed border-mut">
                           <div>
                              <span className="text-xs text-mut font-bold uppercase tracking-wider block mb-1">Harga</span>
                              <span className="font-mono text-grn font-bold">{fmtMon(BigInt(l.priceWei))} tMON</span>
                           </div>
                           <span className="text-xs font-mono bg-ink text-paper px-2 py-1 rounded">Timeout: {l.timeoutMs}s</span>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="card flex justify-center py-16 text-center flex-col items-center gap-6 border-[3px] border-dashed border-mut bg-transparent shadow-none">
                    <Sv id="croc" w={140} className="opacity-50 grayscale" />
                    <p className="text-xl text-mut m-0 font-sans font-medium">Belum ada API yang dijual.</p>
                 </div>
               )}
            </section>

            <section>
              <h3 className="text-3xl mb-6 flex items-center gap-3">
                <span className="bg-ink text-paper w-10 h-10 rounded-full flex items-center justify-center font-bold font-sans text-xl shadow-sm rotate-2">💰</span>
                Riwayat Pendapatan
              </h3>
              {callsLoading ? (
                <div className="card flex justify-center py-12"><div className="sk w-1/2"></div></div>
              ) : calls.length > 0 ? (
                <div className="tw card !p-0 overflow-hidden">
                  <table className="w-full text-sm font-sans border-collapse">
                    <thead className="bg-paper text-ink font-gochi text-lg">
                      <tr>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Waktu</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">API Terjual</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Konsumen</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-left">Pemasukan</th>
                        <th className="!py-4 !px-6 border-b-[3px] border-dashed border-ink text-right">Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((c) => (
                        <tr key={c.callId} className="hover:bg-[#f9f9f9] transition-colors">
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] opacity-70">
                            {new Date(Number(c.reservedAt) * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-medium text-ink">
                             {c.listingName || "Unknown API"}
                          </td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-mono opacity-80">
                             {shortHash(c.consumer)}
                          </td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] font-mono text-grn">+{fmtMon(c.amount)} tMON</td>
                          <td className="!py-4 !px-6 border-b-[2px] border-dashed border-[#e0e0e0] text-right"><TxLink hash={c.finalTx || c.reserveTx} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-16 gap-4 border-[3px] border-dashed border-mut bg-transparent shadow-none">
                  <p className="text-xl text-mut m-0">Belum ada pemasukan.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

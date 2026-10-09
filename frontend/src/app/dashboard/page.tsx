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

  // Hitung hold berdasarkan panggilan yang masih 'reserved'
  const heldByCat = calls.filter(c => c.status === "reserved").reduce((sum, c) => sum + c.amount, 0n);

  const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const int = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 10000);
    return () => clearInterval(int);
  }, []);

  if (!authenticated) {
    return (
      <div className="wrap">
        <section className="card mm-empty">
          <Sv id="cat" w={100} />
          <h2>Log in to open your dashboard</h2>
          <p>Your embedded wallet and balance appear here.</p>
          <button className="btn b-b" onClick={login}>Log in</button>
        </section>
      </div>
    );
  }

  const handleDeposit = () => {
    const v = parseFloat(amt);
    if (v > 0) deposit.mutate(BigInt(Math.round(v * 1e18)));
  };

  const handleWithdraw = () => {
    const v = parseFloat(amt);
    if (v > 0) withdraw.mutate(BigInt(Math.round(v * 1e18)));
  };

  return (
    <div className="wrap">
      <section>
        <h2>Dashboard</h2>
        <p className="mut">Wallet {address} · Monad Testnet</p>
        <div className="tabs">
          <button className={`btn ${tab === "c" ? "b-b" : ""}`} onClick={() => setTab("c")}>Consumer</button>
          <button className={`btn ${tab === "p" ? "b-b" : ""}`} onClick={() => setTab("p")}>Provider</button>
        </div>

        {tab === "c" && (
          <>
            <div className="mm-grid">
              <div className="card">
                <h3>Balance</h3>
                <p style={{ fontSize: "1.8rem", margin: 0 }}>{fmtMon(bal)} tMON</p>
                <p className="mut">held by cat: {fmtMon(heldByCat)} · {fmtIdr(bal)}</p>
              </div>

              <div className="card">
                <h3>Deposit / withdraw</h3>
                <input
                  type="number"
                  step=".001"
                  min="0"
                  value={amt}
                  onChange={(e) => setAmt(e.target.value)}
                  style={{ width: "7em", marginRight: "10px" }}
                  aria-label="Amount"
                />
                <button className="btn b-g" onClick={handleDeposit} disabled={deposit.isPending} style={{ marginRight: 6 }}>
                  Deposit
                </button>
                <button className="btn" onClick={handleWithdraw} disabled={withdraw.isPending}>
                  Withdraw
                </button>
              </div>

              <div className="card">
                <h3>API key</h3>
                {key ? <pre>{key}</pre> : <p className="mut">No key yet. It will be tied to your wallet.</p>}
                <button className="btn b-b" onClick={() => createKey.mutate()} disabled={createKey.isPending}>
                  {key ? "New key" : "Create API key"}
                </button>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>Call history</h3>
            {callsLoading ? (
              <div className="card mm-empty"><p>Loading calls...</p></div>
            ) : calls.length > 0 ? (
              <div className="tw card">
                <table>
                  <thead>
                    <tr>
                      <th>Shop</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Latency</th>
                      <th>Tx</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map((c) => (
                      <tr key={c.callId}>
                        <td>{c.listingName || shortHash(c.provider)}</td>
                        <td>{fmtMon(c.amount)}</td>
                        <td><Badge status={c.status} /></td>
                        <td>{c.finalizedAt ? `${(c.finalizedAt - c.reservedAt) * 1000}ms` : "-"}</td>
                        <td><TxLink hash={c.finalTx || c.reserveTx} /></td>
                        <td>
                          {canForceRefund(c, nowSec) ? (
                            <button
                              className="btn b-r"
                              style={{ padding: "4px 10px", fontSize: "0.9rem" }}
                              onClick={() => forceRefund.mutate(c.callId)}
                              disabled={forceRefund.isPending}
                            >
                              Force Refund
                            </button>
                          ) : (
                            <span className="mut">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card mm-empty">
                <Sv id="monkey" w={80} />
                <p>No calls yet. <Link href="/explore">Send Mimi to a shop</Link>.</p>
              </div>
            )}
          </>
        )}

        {tab === "p" && (
          <>
            <div className="mm-grid">
              <div className="card">
                <h3>Earnings</h3>
                <p style={{ fontSize: "1.8rem", margin: 0 }}>{fmtMon(bal)} tMON</p>
                <p className="mut">Earnings go directly to your balance.</p>
                <button className="btn b-g" onClick={() => setAmt(fmtMon(bal))} style={{ marginTop: 10 }}>
                  Max withdraw
                </button>
              </div>

              <div className="card">
                <h3>Provider Guide</h3>
                <p>
                  Want to host a tiny API? Add your listing to the backend and watch the calls come in.
                  The gateway will verify your schema automatically.
                </p>
                <p className="mut">Provider dashboard coming soon.</p>
              </div>
            </div>

            <h3 style={{ marginTop: 26 }}>Incoming Calls</h3>
            {callsLoading ? (
              <div className="card mm-empty"><p>Loading calls...</p></div>
            ) : calls.length > 0 ? (
              <div className="tw card">
                <table>
                  <thead>
                    <tr>
                      <th>Consumer</th>
                      <th>Earnings</th>
                      <th>Status</th>
                      <th>Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map((c) => (
                      <tr key={c.callId}>
                        <td>{shortHash(c.consumer)}</td>
                        <td>{fmtMon(c.amount)}</td>
                        <td><Badge status={c.status} /></td>
                        <td><TxLink hash={c.finalTx || c.reserveTx} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card mm-empty">
                <p>No incoming calls yet.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

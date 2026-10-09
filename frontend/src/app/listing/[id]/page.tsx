"use client";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useListing, useCallApi, useBalance } from "@/lib/hooks";
import { fmtMon, fmtIdr, exampleFromSchema, txUrl } from "@/lib/format";
import { Sv } from "@/components/Crayon";
import { Badge } from "@/components/ui";
import { svIdFor } from "@/app/explore/page";
import { useSession } from "@/lib/session";

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: l, isLoading, isError } = useListing(id);
  const callApi = useCallApi();
  const { data: bal = 0n } = useBalance();
  const { authenticated, login } = useSession();

  const [inputStr, setInputStr] = useState("");
  const [log, setLog] = useState<{ type: "step" | "error" | "result"; msg: React.ReactNode }[]>([]);

  useEffect(() => {
    if (l && !inputStr) {
      setInputStr(JSON.stringify(exampleFromSchema(l.inputSchema), null, 2));
    }
  }, [l, inputStr]);

  if (isLoading) return <div className="wrap"><section><div className="sk"></div></section></div>;
  if (isError || !l) return (
    <div className="wrap">
      <section className="card mm-empty">
        <h2>That shop is not on the map</h2>
        <p className="err">Listing &quot;{id}&quot; does not exist.</p>
        <Link className="btn" href="/explore" style={{ marginTop: 10 }}>Back to Explore</Link>
      </section>
    </div>
  );

  const sid = svIdFor(l.id);

  async function handleCall() {
    if (!authenticated) { login(); return; }
    let inp;
    try {
      inp = JSON.parse(inputStr);
    } catch {
      setLog([{ type: "error", msg: "Input is not valid JSON. Fix the braces and quotes, then call again." }]);
      return;
    }
    if (bal < BigInt(l.priceWei)) {
      setLog([{ type: "error", msg: <>Not enough balance. <Link href="/dashboard">Deposit tMON</Link> first.</> }]);
      return;
    }

    setLog([{ type: "step", msg: `The cat holds ${fmtMon(l.priceWei)} tMON in reserve.` }]);
    
    callApi.mutate({ listingId: l.id, input: inp }, {
      onSuccess: (res) => {
        const out = res.output ? JSON.stringify(res.output, null, 2) : "";
        const badge = <Badge status={res.status} />;
        const txt = res.status === "released" ? "Coins moved to the provider." :
                    res.status === "refunded" ? `Refunded: ${res.reason || "Provider error"}. Your coins came back.` : 
                    "Failed";
        
        setLog((prev) => [
          ...prev,
          { type: "step", msg: "Response received from provider." },
          { type: "result", msg: (
            <>
              <p style={{ marginTop: 0 }}>
                {badge} {res.status === "refunded" ? <span className="err">{txt}</span> : txt} · {res.latencyMs || 0}ms 
                {res.txHash && <> · tx <a href={txUrl(res.txHash)} target="_blank" rel="noopener noreferrer">{res.txHash.slice(0,10)}…</a></>}
              </p>
              {out && <pre style={{ marginTop: 6 }}>{out}</pre>}
            </>
          )}
        ]);
      },
      onError: (err) => {
        setLog((prev) => [...prev, { type: "error", msg: `Request failed: ${err.message}` }]);
      }
    });
  }

  return (
    <div className="wrap">
      <section>
        <Link href="/explore">← All shops</Link>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="mm-row" style={{ alignItems: "center" }}>
            <Sv id={sid} w={sid === "croc" ? 200 : 110} />
            <div>
              <h1 style={{ fontSize: "2.4rem" }}>{l.name}</h1>
              <p>{l.description}</p>
              <p>
                <span className="chip">{l.category}</span> <b>{fmtMon(l.priceWei)} tMON</b> per call<br/>
                <small className="mut">
                  {fmtIdr(l.priceWei)} (demo rate) · timeout {l.timeoutMs / 1000}s · {Math.round(l.successRate || 0)}% success · {l.avgLatencyMs || 0}ms avg
                </small>
              </p>
            </div>
          </div>

          <h3 style={{ marginTop: 24 }}>Schema</h3>
          <pre>
            input: JSON object{`\n`}
            output must match schema: {l.outputSchema ? Object.keys(l.outputSchema.properties || {}).join(", ") : "any"}
          </pre>

          <h3 style={{ marginTop: 24 }}>Try a call</h3>
          <textarea 
            value={inputStr} 
            onChange={(e) => setInputStr(e.target.value)} 
            aria-label="JSON input"
          />
          <div className="mm-row" style={{ marginTop: 10 }}>
            <button className="btn b-g" onClick={handleCall} disabled={callApi.isPending}>
              {callApi.isPending ? "Calling..." : "Call API"}
            </button>
          </div>

          {log.length > 0 && (
            <div id="res" role="status" aria-live="polite" style={{ marginTop: 20 }}>
              <ol className="steps">
                {log.filter((x) => x.type === "step").map((x, i) => (
                  <li key={i}>{x.msg}</li>
                ))}
              </ol>
              {log.filter((x) => x.type !== "step").map((x, i) => (
                <div key={i} style={{ marginTop: 10 }}>
                  {x.type === "error" ? <p className="err">{x.msg}</p> : x.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

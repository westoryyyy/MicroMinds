"use client";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useListing, useCallApi, useBalance } from "@/lib/hooks";
import { fmtMon, fmtIdr, exampleFromSchema, txUrl } from "@/lib/format";
import { Sv } from "@/components/Crayon";
import { Badge } from "@/components/ui";
import { svIdFor } from "@/app/explore/page";
import { useSession } from "@/lib/session";
import { useLang } from "@/components/LangProvider";

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: l, isLoading, isError } = useListing(id);
  const callApi = useCallApi();
  const { data: bal = 0n } = useBalance();
  const { authenticated, login } = useSession();
  const { t } = useLang();

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
        <h2>{t("That shop is not on the map", "Toko itu tidak ada di peta")}</h2>
        <p className="err">{t(`Listing "${id}" does not exist.`, `Listing "${id}" tidak ditemukan.`)}</p>
        <Link className="btn" href="/explore" style={{ marginTop: 10 }}>{t("Back to Explore", "Kembali ke Eksplor")}</Link>
      </section>
    </div>
  );

  const sid = svIdFor(l.id);

  async function handleCall() {
    if (!l) return;
    if (!authenticated) { login(); return; }
    let inp;
    try {
      inp = JSON.parse(inputStr);
    } catch {
      setLog([{ type: "error", msg: t("Input is not valid JSON. Fix the braces and quotes, then call again.", "Input bukan JSON yang valid. Perbaiki kurung kurawal dan tanda petik, lalu coba lagi.") }]);
      return;
    }
    if (bal < BigInt(l.priceWei)) {
      setLog([{ type: "error", msg: <>{t("Not enough balance.", "Saldo tidak mencukupi.")} <Link href="/dashboard">{t("Deposit tMON", "Isi tMON")}</Link> {t("first.", "terlebih dahulu.")}</> }]);
      return;
    }

    setLog([{ type: "step", msg: t(`The cat holds ${fmtMon(l.priceWei)} tMON in reserve.`, `Kucing menahan ${fmtMon(l.priceWei)} tMON sebagai cadangan.`) }]);
    
    callApi.mutate({ listingId: l.id, input: inp }, {
      onSuccess: (res) => {
        const out = res.output ? JSON.stringify(res.output, null, 2) : "";
        const badge = <Badge status={res.status} />;
        const txt = res.status === "released" ? t("Coins moved to the provider.", "Koin diserahkan ke penyedia.") :
                    res.status === "refunded" ? t(`Refunded: ${res.reason || "Provider error"}. Your coins came back.`, `Dikembalikan: ${res.reason || "Kesalahan penyedia"}. Koin kamu kembali.`) : 
                    t("Failed", "Gagal");
        
        setLog((prev) => [
          ...prev,
          { type: "step", msg: t("Response received from provider.", "Respons diterima dari penyedia.") },
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
        setLog((prev) => [...prev, { type: "error", msg: `${t("Request failed: ", "Permintaan gagal: ")}${err.message}` }]);
      }
    });
  }

  return (
    <div className="wrap">
      <section>
        <Link href="/explore">← {t("All shops", "Semua toko")}</Link>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="mm-row" style={{ alignItems: "center" }}>
            <Sv id={sid} w={sid === "croc" ? 200 : 110} />
            <div>
              <h1 style={{ fontSize: "2.4rem" }}>{l.name}</h1>
              <p>{l.description}</p>
              <p>
                <span className="chip">{l.category}</span> <b>{fmtMon(l.priceWei)} tMON</b> {t("per call", "per panggilan")}<br/>
                <small className="mut">
                  {fmtIdr(l.priceWei)} {t("(demo rate)", "(tarif demo)")} · {t("timeout", "batas waktu")} {l.timeoutMs / 1000}s · {Math.round(l.successRate || 0)}% {t("success", "sukses")} · {l.avgLatencyMs || 0}ms {t("avg", "rata-rata")}
                </small>
              </p>
            </div>
          </div>

          <h3 style={{ marginTop: 24 }}>{t("Schema", "Skema")}</h3>
          <pre>
            {t("input: JSON object", "input: Objek JSON")}{`\n`}
            {t("output must match schema: ", "output harus sesuai skema: ")}{l.outputSchema ? Object.keys(l.outputSchema.properties || {}).join(", ") : t("any", "bebas")}
          </pre>

          <h3 style={{ marginTop: 24 }}>{t("Try a call", "Coba Panggil")}</h3>
          <textarea 
            value={inputStr} 
            onChange={(e) => setInputStr(e.target.value)} 
            aria-label={t("JSON input", "Input JSON")}
          />
          <div className="mm-row" style={{ marginTop: 10 }}>
            <button className="btn b-g" onClick={handleCall} disabled={callApi.isPending}>
              {callApi.isPending ? t("Calling...", "Memanggil...") : t("Call API", "Panggil API")}
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

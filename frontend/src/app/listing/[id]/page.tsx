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
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
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

    setLog([{ type: "step", msg: t(`Escrow smart contract holds ${fmtMon(l.priceWei)} tMON in reserve.`, `Smart contract escrow menahan ${fmtMon(l.priceWei)} tMON sebagai cadangan.`) }]);
    
    callApi.mutate({ listingId: l.id, input: inp }, {
      onSuccess: (res) => {
        const out = res.output ? JSON.stringify(res.output, null, 2) : "";
        const badge = <Badge status={res.status} />;
        const txt = res.status === "released" ? t("Funds released to provider on-chain.", "Dana dirilis ke penyedia on-chain.") :
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

          {/* Autonomous AI Agent (MCP) Card */}
          <div className="bg-[#836EF9]/10 border-[3px] border-solid border-[#836EF9] p-5 md:p-6 rounded-[16px_4px_16px_4px]" style={{ marginTop: 24, marginBottom: 24 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <h3 className="m-0 text-2xl font-bold text-ink">
                  {t("Use with Autonomous AI Agent (MCP)", "Gunakan dengan Agen AI Otonom (MCP)")}
                </h3>
              </div>
              <span className="badge b-g !text-xs font-mono">⚡ 100% Agent-Ready on Monad</span>
            </div>
            <p className="text-sm md:text-base text-mut font-sans m-0 mb-4 leading-relaxed">
              {t(
                "Your AI Agent in Claude Desktop, Cursor, or VS Code can autonomously discover, negotiate, and execute this microservice with on-chain escrow protection on Monad Testnet.",
                "Agen AI kamu di Claude Desktop, Cursor, atau VS Code dapat mencari, menawar, dan mengeksekusi layanan mikro ini secara otonom dengan perlindungan escrow on-chain di Monad Testnet."
              )}
            </p>

            <div className="bg-paper border-[2px] border-dashed border-mut p-4 rounded-[10px_4px_10px_4px]">
              <span className="text-xs font-bold uppercase tracking-wider text-mut block mb-1">
                💬 {t("Suggested Agent Prompt:", "Prompt Agen Siap Pakai:")}
              </span>
              <p className="font-mono text-sm text-ink m-0 mb-3 select-all">
                {`"Please search MicroMinds for '${l.name}' and execute it for my current task on Monad testnet."`}
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn b-b !py-1 !px-3 !text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`Please search MicroMinds for '${l.name}' and execute it for my current task on Monad testnet.`);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                >
                  {copiedPrompt ? t("Prompt Copied! ✅", "Prompt Tersalin! ✅") : t("Copy Agent Prompt", "Salin Prompt Agen")}
                </button>
                <button 
                  className="btn b-w !py-1 !px-3 !text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(l.id);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                >
                  {copiedId ? t("UUID Copied! ✅", "UUID Tersalin! ✅") : t("Copy Listing UUID", "Salin UUID Listing")}
                </button>
                <Link className="btn b-y !py-1 !px-3 !text-sm" href="/docs">
                  📖 {t("View Setup Guide", "Lihat Panduan Setup")}
                </Link>
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: 24 }}>{t("Manual Web Testing (Sandbox)", "Pengujian Web Manual (Sandbox)")}</h3>
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

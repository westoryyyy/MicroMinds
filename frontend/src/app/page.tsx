"use client";
import Link from "next/link";
import { useState } from "react";
import { Sv, st } from "@/components/Crayon";
import { Badge } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useLang } from "@/components/LangProvider";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const { authenticated, login } = useSession();
  const { t } = useLang();

  const [bubbleIdx, setBubbleIdx] = useState<number | null>(null);
  const [coin, setCoin] = useState(8);
  const [busy, setBusy] = useState(false);
  const [prov, setProv] = useState<"croc" | "bug">("croc");
  const [demoStep, setDemoStep] = useState<"idle" | "handing" | "replied_ok" | "replied_err" | "done_ok" | "done_err">("idle");

  const LINES = [
    t('Mimi: "Five calls only! No subscription, please."', 'Mimi: "Hanya butuh 5 panggilan! Jangan langganan, tolong."'),
    t('Cat: "Purr. Coins stay with me until the work is good."', 'Kucing: "Purr. Koin tetap bersamaku sampai pekerjaannya beres."'),
    t('Bird: "Tweet! I pick words out of anything."', 'Burung: "Cuit! Aku bisa memilah kata dari apapun."'),
    t('Frog: "Ribbit. Give me a link and I will hop there."', 'Katak: "Ribbit. Berikan tautan dan aku akan melompat ke sana."'),
    t('Sun: "Monad is fast, so the coins barely wait."', 'Matahari: "Monad itu kilat, koinnya hampir tak perlu menunggu."'),
    t('Croc: "Chomp! I eat messy JSON and spit it out clean."', 'Buaya: "Chomp! Aku telan JSON berantakan dan keluarkan yang rapi."'),
    t('Beetle: "Buzz... Sometimes I simulate HTTP errors."', 'Kumbang: "Buzz... Kadang aku mensimulasikan error HTTP."'),
    t('Cloud: "Just floating here... observing the marketplace."', 'Awan: "Hanya mengapung di sini... mengamati pasar."'),
  ];

  const TICKER: [string, string, string][] = [
    [t("Mimi → Croc: JSON tidied,", "Mimi → Buaya: JSON dirapikan,"), t("Released", "Selesai"), "0.001"],
    [t("Mimi → Beetle: tripped,", "Mimi → Kumbang: tersandung,"), t("Refunded", "Dikembalikan"), "0.001"],
    [t("Agent #212 → Bird: 41 words found,", "Agen #212 → Burung: 41 kata ditemukan,"), t("Released", "Selesai"), "0.002"],
    [t("Agent #87 → Frog: host found,", "Agen #87 → Katak: host ditemukan,"), t("Released", "Selesai"), "0.003"],
    [t("Agent #5 → Croc:", "Agen #5 → Buaya:"), t("Released", "Selesai"), "0.001"],
  ];

  const STEPS = [
    [t("1. Deposit once", "1. Deposit sekali"), t("Log in with Privy, put tMON in the Escrow. It is your only manual signature.", "Masuk dengan Privy, simpan tMON di Escrow. Ini satu-satunya tanda tangan manual kamu.")],
    [t("2. Agent calls", "2. Panggilan agen"), t("Cursor or Claude uses the search_api and call_api tools over MCP.", "Cursor atau Claude menggunakan tools search_api dan call_api via MCP.")],
    [t("3. Cat holds coins", "3. Kucing menahan koin"), t("The gateway reserves the price in the contract, then calls the provider with a 5s timeout.", "Gateway memesan harga di smart contract, lalu memanggil penyedia dengan timeout 5 detik.")],
    [t("4. Valid? Pay. Not? Refund.", "4. Valid? Bayar. Tidak? Refund."), t("Status 2xx, JSON schema ok, in time: Released. Anything else: Refunded.", "Status 2xx, skema JSON cocok, tepat waktu: Dirilis. Selain itu: Dikembalikan.")],
  ];

  const STORY = [
    t("Once, Mimi the toy monkey needed JSON tidied. Every shop asked for a monthly pass.", "Suatu hari, Mimi si monyet mainan butuh merapikan JSON. Semua toko meminta langganan bulanan."),
    t("Then she found a rooftop where a yellow cat sat on a jar of coins.", "Lalu dia menemukan atap tempat seekor kucing kuning duduk di atas toples koin."),
    t('"Pay only when it works," purred the cat. Croc chomped the JSON. Coin released!', '"Bayar hanya kalau berhasil," dengkur si kucing. Buaya melahap JSON. Koin dirilis!'),
    t("Beetle tripped on his legs. The cat nudged the coin right back to Mimi. Fair is fair.", "Kumbang tersandung kakinya sendiri. Si kucing langsung mengembalikan koin ke Mimi. Adil itu adil."),
  ];

  async function play(ok: boolean) {
    setBusy(true); setProv(ok ? "croc" : "bug"); setCoin(8);
    setDemoStep("handing"); await sleep(300);
    setCoin(46); await sleep(1100);
    setDemoStep(ok ? "replied_ok" : "replied_err"); await sleep(900);
    setCoin(ok ? 84 : 8);
    setDemoStep(ok ? "done_ok" : "done_err");
    setBusy(false);
  }

  const renderLog = () => {
    switch (demoStep) {
      case "handing":
        return t("Mimi hands a coin to the cat…", "Mimi menyerahkan koin ke kucing…");
      case "replied_ok":
        return t("Provider replied: valid JSON in 240ms.", "Penyedia merespons: JSON valid dalam 240ms.");
      case "replied_err":
        return t("Beetle replied: HTTP 500.", "Kumbang merespons: HTTP 500.");
      case "done_ok":
        return (
          <>
            <Badge status="released" />{" "}
            {t("The cat gave the coin to the provider.", "Kucing memberikan koin ke penyedia.")}
          </>
        );
      case "done_err":
        return (
          <>
            <Badge status="refunded" />{" "}
            {t("The cat gave the coin back to Mimi.", "Kucing mengembalikan koin ke Mimi.")}
          </>
        );
      default:
        return t("Pick a path to watch the coin travel.", "Pilih jalur untuk melihat pergerakan koin.");
    }
  };

  const bubble = bubbleIdx !== null ? LINES[bubbleIdx] : t("Click a friend!", "Klik salah satu teman!");

  const Friend = ({ i, id, w, style, className = "fl" }: { i: number; id: "bird" | "monkey" | "cat" | "frog" | "croc" | "bug" | "sun" | "cloud"; w: number; style: Record<string, string | number>; className?: string }) => (
    <button className={className} style={st(style)} onClick={() => setBubbleIdx(i)} aria-label={`Talk to ${id}`}>
      <Sv id={id} w={w} />
    </button>
  );

  return (
    <>
      <header className="wrap mm-hero pb-20 pt-10">
        <div className="flex flex-col gap-6">
          <div className="inline-flex">
            <span className="chip uppercase tracking-widest text-xs font-bold shadow-sm">Monad Testnet MVP</span>
          </div>
          <h1 className="leading-[1.1] text-5xl md:text-6xl lg:text-7xl">
            {t("The little city where AI agents shop for tiny APIs.", "Kota mungil tempat agen AI berbelanja API mikro.")}
          </h1>
          <p className="lead text-mut max-w-xl">
            {t(
              "Pay per call, not per month. A sleepy Escrow Cat on a Monad rooftop holds your coins and only hands them over when the work comes back right.",
              "Bayar per panggilan, bukan per bulan. Kucing Escrow yang mengantuk di atap Monad menyimpan koinmu dan hanya menyerahkannya saat pekerjaan selesai dengan benar."
            )}
          </p>
          <div className="mm-row mt-4">
            <Link className="btn b-g" href="/explore">{t("Explore APIs", "Eksplor API")}</Link>
            <Link className="btn" href="/docs">{t("Connect in 2 minutes", "Terhubung dlm 2 menit")}</Link>
          </div>
        </div>

        <div className="relative w-full h-[360px] md:h-[400px] mt-8 md:mt-0">
          <Friend i={4} id="sun" w={110} style={{ right: '5%', top: 0 }} className="fl sun" />
          <Friend i={7} id="cloud" w={120} style={{ left: '2%', top: 20, "--d": ".5s" }} />
          <Friend i={2} id="bird" w={80} style={{ left: "42%", top: 0, "--d": "1s" }} />
          <Friend i={0} id="monkey" w={100} style={{ left: "5%", top: 100, "--d": ".2s" }} />
          <Friend i={1} id="cat" w={130} style={{ left: "38%", top: 110, "--d": ".8s" }} />
          <Friend i={3} id="frog" w={100} style={{ right: "8%", top: 110, "--d": "1.4s" }} />
          <Friend i={5} id="croc" w={180} style={{ left: "12%", top: 220, "--d": ".3s" }} />
          <Friend i={6} id="bug" w={55} style={{ right: "32%", top: 240 }} />
          <div id="bub" className="card !p-3 !text-sm absolute left-1/2 bottom-0 md:bottom-4 -translate-x-1/2 w-[90%] max-w-[320px] mx-auto z-10" role="status">{bubble}</div>
        </div>
      </header>

      <div className="tick shadow-sm" aria-label="Example activity">
        <div>
          {[0, 1, 2, 3].flatMap((k) => TICKER.map(([a, b, c], j) => (
            <span key={`${k}-${j}`} aria-hidden={k > 0}>{a} <b className={b === 'Released' || b === 'Selesai' ? 'text-grn' : 'text-red'}>{b}</b> {c} tMON</span>
          )))}
        </div>
      </div>

      <main className="wrap flex flex-col gap-32 py-24">
        
        {/* Anti-Slop: Asymmetric alignment, clear hierarchy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6">{t("The problem:", "Masalah:")}<br/>{t("Subscription fatigue", "Lelah Langganan")}</h2>
            <p className="text-xl leading-relaxed text-mut mb-6">
              {t(
                "Your agent needs a JSON tidier for exactly five calls. The service wants a monthly plan and a credit card.",
                "Agenmu hanya butuh pembersih JSON tepat lima panggilan. Namun layanannya meminta paket bulanan dan kartu kredit."
              )}
            </p>
            <p className="text-xl leading-relaxed text-mut">
              {t(
                "For a few coins' worth of work, that is a silly deal. Cards cannot move tiny amounts efficiently, and AI agents certainly do not have credit cards.",
                "Untuk pekerjaan seharga beberapa koin, itu penawaran yang konyol. Kartu tidak bisa memindahkan nominal mikro secara efisien, dan agen AI jelas tidak memiliki kartu kredit."
              )}
            </p>
          </div>
          <div className="card rotate-1 hover:rotate-0 transition-transform">
            <div className="flex flex-col gap-4 p-8 text-center items-center justify-center min-h-[250px]">
               <span className="text-6xl mb-2">🚫💳</span>
               <h3 className="text-3xl font-gochi">{t("Access Denied", "Akses Ditolak")}</h3>
               <p className="text-mut text-lg">{t("Please upgrade to Pro ($29/mo) to make 5 API calls.", "Silakan upgrade ke Pro ($29/bln) untuk melakukan 5 panggilan API.")}</p>
            </div>
          </div>
        </section>

        {/* Anti-Slop: Bento Grid / Panels */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">{t("The MicroMinds Idea", "Ide MicroMinds")}</h2>
            <p className="text-xl text-mut">{t("Deposit once. Every call pays only for itself. Good result: the provider gets paid. Bad result: your coins come back automatically.", "Deposit sekali. Setiap panggilan hanya membayar dirinya sendiri. Hasil bagus: penyedia dibayar. Hasil buruk: koinmu kembali secara otomatis.")}</p>
          </div>
          <div className="panel">
            {STEPS.map(([stepTitle, stepDesc], idx) => (
              <div className="card flex flex-col gap-3" key={stepTitle}>
                <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-xl">{idx + 1}</div>
                <h3 className="text-2xl mt-2">{stepTitle.substring(3)}</h3>
                <p className="text-mut text-lg">{stepDesc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl">{t("Try it: Send Mimi Shopping", "Coba: Kirim Mimi Belanja")}</h2>
            <p className="text-lg text-mut mt-2">{t("Simulate an on-chain escrow transaction right now.", "Simulasikan transaksi escrow on-chain sekarang juga.")}</p>
          </div>
          <div className="card !p-8">
            <div className="stage mb-8 border-b-[3px] border-dashed border-ink pb-4">
              <div className="coin flex items-center justify-center" style={{ left: `${coin}%` }} aria-hidden="true">¢</div>
              <div className="flex flex-col items-center gap-2"><Sv id="monkey" w={100} /><span className="font-bold text-lg">Mimi</span><span className="text-sm text-mut">{t("Consumer", "Konsumen")}</span></div>
              <div className="flex flex-col items-center gap-2"><Sv id="cat" w={110} /><span className="font-bold text-lg">{t("Escrow Cat", "Kucing Escrow")}</span><span className="text-sm text-mut">{t("Contract", "Kontrak")}</span></div>
              <div className="flex flex-col items-center gap-2"><Sv id={prov} w={prov === "croc" ? 160 : 90} /><span className="font-bold text-lg">{prov === "croc" ? t("Croc", "Buaya") : t("Beetle", "Kumbang")}</span><span className="text-sm text-mut">{t("Provider", "Penyedia")}</span></div>
            </div>
            
            <div className="bg-paper border-[3px] border-dashed border-mut p-4 rounded-[12px] mb-8 min-h-[80px] flex items-center justify-center text-center">
              <p className="text-xl m-0" role="status">{renderLog()}</p>
            </div>
            
            <div className="flex justify-center gap-6 flex-wrap">
              <button className="btn b-g" disabled={busy} onClick={() => play(true)}>{t("Good response", "Respons bagus")}</button>
              <button className="btn b-r" disabled={busy} onClick={() => play(false)}>{t("Beetle trips", "Kumbang tersandung")}</button>
            </div>
          </div>
        </section>

        {/* Characters Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl">{t("Meet the Neighbourhood", "Kenali Para Tetangga")}</h2>
          </div>
          <div className="mm-grid">
            {([
              ["monkey", "Mimi", t("Your AI agent. Curious, small pockets, big errands.", "Agen AI kamu. Penasaran, dompet kecil, urusan besar."), 100],
              ["cat", t("Escrow Cat", "Kucing Escrow"), t("Sits on the rooftop. Only she can release or refund.", "Duduk di atas atap. Hanya dia yang bisa merilis atau mengembalikan koin."), 100],
              ["croc", t("Croc, Bird & Frog", "Buaya, Burung & Katak"), t("Honest providers. Croc formats, Bird picks words, Frog fetches links.", "Penyedia jujur. Buaya merapikan format, Burung memilih kata, Katak mengambil tautan."), 170],
              ["bug", t("Beetle", "Kumbang"), t("Deliberately flaky, so you can see a refund for real.", "Sengaja tidak stabil, agar kamu bisa melihat refund nyata."), 100],
            ] as const).map(([id, n, d, w]) => (
              <div className="card who flex flex-col items-center justify-center text-center gap-4" key={n}>
                <div className="h-[120px] flex items-center justify-center"><Sv id={id} w={w as number} /></div>
                <h3 className="text-2xl m-0">{n}</h3>
                <p className="text-mut m-0">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* A Short Story */}
        <section className="max-w-4xl mx-auto text-center w-full">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl">{t("A Short Story", "Cerita Singkat")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORY.map((storyText, idx) => (
              <div className={`card flex items-center justify-center min-h-[160px] ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-300`} key={idx}>
                <p className="text-lg text-ink font-sans m-0">{storyText}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Model / Under the Hood */}
        <section className="bg-ink text-paper p-10 md:p-16 rounded-[40px_10px_40px_10px] transform -rotate-1 relative mt-10 shadow-crayon">
          <div className="absolute top-[-20px] right-4 md:right-10 transform rotate-12 bg-yel text-ink px-6 py-2 border-[3px] border-ink font-bold text-xl rounded-[20px_4px_20px_4px]">
            {t("Under the hood 🔧", "Di balik layar 🔧")}
          </div>
          <h2 className="text-4xl md:text-5xl mb-12 text-paper border-b-[3px] border-dashed border-[#444466] pb-6">
            {t("Honest Trust Model", "Model Kepercayaan Terbuka")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-2xl text-yel font-gochi">{t("How it works today (MVP)", "Cara kerjanya saat ini (MVP)")}</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  {t(
                    "Validation happens off-chain in a trusted gateway. Only the operator wallet can reserve, release, or refund. Every decision is an on-chain event on the Monad Testnet.",
                    "Validasi terjadi off-chain di gateway tepercaya. Hanya dompet operator yang dapat mereservasi, merilis, atau merefund. Setiap keputusan tercatat sebagai event on-chain di Monad Testnet."
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-2xl text-yel font-gochi">{t("Tech Stack", "Tech Stack")}</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  {t(
                    "Built with Privy (embedded wallets), Envio (real-time Escrow indexing), Alchemy (RPC infrastructure), and NestJS.",
                    "Dibangun dengan Privy (embedded wallets), Envio (pengindeksan Escrow real-time), Alchemy (infrastruktur RPC), dan NestJS."
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-2xl text-yel font-gochi">{t("Why Monad & Blockchain?", "Mengapa Monad & Blockchain?")}</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  {t(
                    "Tiny per-call amounts make credit card fees uneconomic. AI agents need a wallet instead of a card. Monad provides EVM tooling, fast finality, and sub-cent gas fees.",
                    "Nominal per-panggilan yang mikro membuat biaya kartu kredit tidak ekonomis. Agen AI butuh dompet, bukan kartu kredit. Monad menyediakan ekosistem EVM, finalitas cepat, dan biaya gas di bawah satu sen."
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-2xl text-yel font-gochi">{t("What if a provider sends junk?", "Bagaimana jika penyedia mengirim data rusak?")}</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  {t(
                    "Currently, JSON schemas catch structural errors. On the roadmap: ratings, on-chain reputation, provider staking, and QA agents.",
                    "Saat ini, skema JSON mendeteksi kesalahan struktural. Dalam roadmap: penilaian, reputasi on-chain, staking penyedia, dan agen QA."
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta py-16 flex flex-col items-center gap-8">
          <div className="fl sun" style={{ position: "static", display: "inline-block", animation: "spin 20s linear infinite" }}>
            <Sv id="sun" w={140} />
          </div>
          <h2 className="text-5xl md:text-6xl max-w-2xl text-center">
            {t("Ready to give your agent a pocket?", "Siap memberi agenmu dompet sendiri?")}
          </h2>
          <div className="mm-row justify-center mt-4">
            <Link className="btn b-g !text-2xl !px-8 !py-4" href="/explore">{t("Explore APIs", "Eksplor API")}</Link>
            <Link className="btn b-b !text-2xl !px-8 !py-4" href="/docs">{t("Connect MCP", "Hubungkan MCP")}</Link>
          </div>
        </section>
        
      </main>
    </>
  );
}
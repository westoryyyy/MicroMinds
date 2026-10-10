"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useApiKey } from "@/lib/hooks";
import { CFG } from "@/lib/config";
import { Sv } from "@/components/Crayon";
import { useLang } from "@/components/LangProvider";

export default function DocsPage() {
  const { key } = useApiKey();
  const [sw, setSw] = useState(false);
  const [swt, setSwt] = useState("0.0");
  const [swi, setSwi] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  const [listingId, setListingId] = useState<string>("YOUR_LISTING_ID_HERE");
  const [activeTab, setActiveTab] = useState<'mcp' | 'api' | 'playground'>('mcp');
  const { t } = useLang();

  useEffect(() => {
    fetch(`${CFG.apiBase}/listings`)
      .then(async res => {
        if (!res.ok) return [];
        const text = await res.text();
        if (!text || text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
          return [];
        }
        return JSON.parse(text);
      })
      .then(data => {
        if (data && data.length > 0) {
          const ai = data.find((d: any) => d.name === 'AI Assistant') || data[0];
          setListingId(ai.id);
        }
      })
      .catch(() => {});
  }, []);

  const k = key || "mm_log_in_to_get_your_key";
  const cfg = JSON.stringify({
    mcpServers: {
      microminds: {
        command: "npx",
        args: ["-y", "microminds-mcp"],
        env: {
          MICROMINDS_API_KEY: k,
          MICROMINDS_BASE_URL: CFG.apiBase
        }
      }
    }
  }, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cfg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(t("Select the text and copy it by hand.", "Pilih teks dan salin secara manual."));
    }
  };

  const handleSw = () => {
    if (swi) {
      clearInterval(swi);
      setSwi(null);
      setSw(false);
    } else {
      const t0 = Date.now();
      const int = setInterval(() => {
        setSwt(((Date.now() - t0) / 1000).toFixed(1));
      }, 100);
      setSwi(int);
      setSw(true);
    }
  };

  useEffect(() => {
    return () => { if (swi) clearInterval(swi); };
  }, [swi]);

  return (
    <>
      <header className="wrap py-12 md:py-20 border-b-[3px] border-dashed border-mut">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl mb-4">{t("Connect to MicroMinds", "Hubungkan ke MicroMinds")}</h1>
            <p className="text-xl text-mut leading-relaxed m-0">
              {t("MicroMinds offers THREE powerful ways to consume decentralized APIs. You can give your AI Agent autonomous access via the ", "MicroMinds menawarkan TIGA cara ampuh untuk mengkonsumsi API terdesentralisasi. Kamu bisa memberikan agen AI mu akses otonom lewat ")}<strong>Model Context Protocol (MCP)</strong>{t(", integrate it directly into your own code like a traditional API, or test it live in our Web Playground.", ", mengintegrasikan langsung ke kodemu layaknya API tradisional, atau mengujinya secara langsung di Web Playground kami.")}
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <div className="bg-yel border-[3px] border-solid border-ink rounded-full w-24 h-24 flex items-center justify-center rotate-12 shadow-sm animate-bob">
              <span className="text-4xl">🔌</span>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap py-12 flex flex-col gap-12">
        
        {/* Tabs Selection */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button 
              className={`btn !text-lg !px-6 !py-3 ${activeTab === 'mcp' ? 'b-b' : 'b-w'}`}
              onClick={() => setActiveTab('mcp')}
            >
              🤖 {t("For AI Agents (MCP)", "Untuk Agen AI (MCP)")}
            </button>
            <button 
              className={`btn !text-lg !px-6 !py-3 ${activeTab === 'api' ? 'b-r' : 'b-w'}`}
              onClick={() => setActiveTab('api')}
            >
              💻 {t("For Developers (Direct API)", "Untuk Developer (API Langsung)")}
            </button>
            <button 
              className={`btn !text-lg !px-6 !py-3 ${activeTab === 'playground' ? 'b-g' : 'b-w'}`}
              onClick={() => setActiveTab('playground')}
            >
              🕹️ {t("Web Playground (Testing)", "Web Playground (Pengujian)")}
            </button>
          </div>

          <div className="card !p-6 md:!p-12 relative">
            
            {/* TAB 1: MCP */}
            {activeTab === 'mcp' && (
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl mb-6 text-center">{t("Method 1: For AI Agents (Cursor, Claude)", "Metode 1: Untuk Agen AI (Cursor, Claude)")}</h2>
                <p className="text-lg text-mut font-sans text-center mb-8">
                  {t("Use MCP to let your AI Agents automatically discover, negotiate, and pay for APIs on your behalf.", "Gunakan MCP agar Agen AI kamu bisa otomatis mencari, menawar, dan membayar API untukmu.")}
                </p>

                {/* Step 1 */}
                <div className="flex gap-6 md:gap-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm rotate-2">1</div>
                    <div className="w-[3px] h-full bg-ink opacity-20 border-l-[3px] border-dashed border-ink mt-4"></div>
                  </div>
                  <div className="flex-1 min-w-0 pb-16">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <h3 className="text-3xl m-0">{t("Add Config to Cursor", "Tambahkan Config ke Cursor")}</h3>
                      <button className="btn b-b !py-2 !px-5 !text-lg shrink-0 w-full sm:w-auto" onClick={handleCopy}>
                        {copied ? t("Copied! ✅", "Tersalin! ✅") : t("Copy config", "Salin config")}
                      </button>
                    </div>
                    <p className="text-lg text-mut mb-4 mt-0 font-sans">
                      {t("No installation needed! Just paste this into your Cursor MCP settings. ", "Tanpa instalasi! Cukup tempel ini di pengaturan MCP Cursor kamu. ")}{key ? t("It's already filled with your API key.", "Sudah terisi dengan API key kamu.") : <><Link href="/dashboard" className="text-blu font-bold">{t("Log in and create a key", "Login dan buat key")}</Link> {t("to fill it in automatically.", "agar otomatis terisi.")}</>}
                    </p>
                    <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
                      {cfg}
                    </pre>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 md:gap-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm -rotate-2">2</div>
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <h3 className="text-3xl m-0 mb-2">{t("Restart & Test", "Restart & Coba")}</h3>
                    <p className="text-lg text-mut mb-4 mt-0 font-sans">
                      {t("Restart your IDE, open the chat, and type a prompt like:", "Restart IDE kamu, buka obrolan, dan ketik perintah seperti:")}
                    </p>
                    <div className="bg-paper border-[3px] border-dashed border-mut p-4 md:p-6 rounded-[12px_4px_12px_4px] text-center mb-4">
                      <span className="font-sans text-ink font-medium md:text-lg">{t(`"Find an API that tidies JSON, then use it on `, `"Cari API yang merapikan JSON, lalu gunakan pada `)}<code className="bg-card text-blu px-2 py-1 border border-solid border-mut rounded text-sm md:text-base">{`{a:1,b:[2,3]}`}</code>"</span>
                    </div>
                    <p className="text-lg text-mut m-0 font-sans">
                      {t("The agent will automatically download the MCP server via ", "Agen AI akan otomatis mengunduh server MCP via ")}<code>npx</code>{t(", map the tools, and report back the status and transaction hash.", ", memetakan tool, dan melaporkan status beserta hash transaksinya.")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Direct API */}
            {activeTab === 'api' && (
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl mb-4 text-center">{t("Method 2: Direct API Access", "Metode 2: Akses API Langsung")}</h2>
                <p className="text-lg text-mut font-sans text-center mb-10">
                  {t("Don't want to use MCP? You can call MicroMinds directly from your code using your API key. Integrate it into your Node.js or Python backend easily!", "Tidak ingin menggunakan MCP? Kamu bisa memanggil MicroMinds langsung dari kodemu menggunakan API key. Integrasikan dengan mudah ke backend Node.js atau Python kamu!")}
                </p>
                
                <div className="flex flex-col gap-8">
                  {/* Mac/Linux cURL */}
                  <div>
                    <h4 className="text-xl m-0 mb-2 font-bold">1. Mac / Linux / Git Bash (cURL)</h4>
                    <div className="relative">
                      <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
{`curl -X POST ${CFG.apiBase}/call \\
  -H "x-api-key: ${key || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "listingId": "${listingId}",
    "input": {
      "prompt": "Hello AI, write me a poem!"
    }
  }'`}
                      </pre>
                    </div>
                  </div>

                  {/* Windows CMD cURL */}
                  <div>
                    <h4 className="text-xl m-0 mb-2 font-bold">2. Windows CMD (cURL)</h4>
                    <div className="relative">
                      <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
{`curl -X POST ${CFG.apiBase}/call ^
  -H "x-api-key: ${key || "YOUR_API_KEY"}" ^
  -H "Content-Type: application/json" ^
  -d "{\\"listingId\\": \\"${listingId}\\", \\"input\\": { \\"prompt\\": \\"Hello AI, write me a poem!\\" }}"`}
                      </pre>
                    </div>
                  </div>

                  {/* Node.js (Fetch) */}
                  <div>
                    <h4 className="text-xl m-0 mb-2 font-bold">3. Node.js (Javascript)</h4>
                    <div className="relative">
                      <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
{`fetch("${CFG.apiBase}/call", {
  method: "POST",
  headers: {
    "x-api-key": "${key || "YOUR_API_KEY"}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    listingId: "${listingId}",
    input: { prompt: "Hello AI, write me a poem!" }
  })
})
.then(res => res.json())
.then(console.log);
`}
                      </pre>
                    </div>
                  </div>

                  {/* Python */}
                  <div>
                    <h4 className="text-xl m-0 mb-2 font-bold">4. Python (Requests)</h4>
                    <div className="relative">
                      <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
{`import requests

response = requests.post(
    "${CFG.apiBase}/call",
    headers={
        "x-api-key": "${key || "YOUR_API_KEY"}",
        "Content-Type": "application/json"
    },
    json={
        "listingId": "${listingId}",
        "input": { "prompt": "Hello AI, write me a poem!" }
    }
)
print(response.json())
`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Playground */}
            {activeTab === 'playground' && (
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl mb-4 text-center">{t("Method 3: Web Playground", "Metode 3: Web Playground")}</h2>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-yel border-[3px] border-solid border-ink rounded-full w-24 h-24 flex items-center justify-center shadow-sm mb-6">
                    <span className="text-4xl">🕹️</span>
                  </div>
                  <p className="text-xl text-mut font-sans max-w-2xl mb-6">
                    {t("Just want to test if an API works before writing code? You can use our built-in ", "Hanya ingin menguji apakah sebuah API bekerja sebelum menulis kode? Kamu bisa menggunakan ")}<strong>Web Playground</strong>{t(" directly on any API's detail page.", " bawaan kami langsung di halaman detail API mana saja.")}
                  </p>
                  
                  <div className="bg-paper border-[3px] border-dashed border-mut p-6 md:p-8 rounded-[12px_4px_12px_4px] text-left max-w-2xl w-full">
                    <h4 className="text-2xl m-0 mb-4 text-ink">{t("How it works:", "Cara kerja:")}</h4>
                    <ul className="text-lg font-sans text-mut flex flex-col gap-3 m-0 pl-5">
                      <li><strong>{t("Step 1:", "Langkah 1:")}</strong> {t("Go to the ", "Buka halaman ")}<Link href="/explore" className="text-blu font-bold">{t("Explore", "Eksplor")}</Link>{t(" page and select any API.", " dan pilih API apa saja.")}</li>
                      <li><strong>{t("Step 2:", "Langkah 2:")}</strong> {t('Scroll down to the "Try a call" box.', 'Gulir ke bawah ke kotak "Coba Panggil".')}</li>
                      <li><strong>{t("Step 3:", "Langkah 3:")}</strong> {t('Enter your test payload (JSON) and click "Call API".', 'Masukkan payload tes kamu (JSON) dan klik "Panggil API".')}</li>
                    </ul>
                    <div className="mt-6 p-4 bg-red/10 border-[2px] border-solid border-red rounded-md">
                      <p className="m-0 text-red font-sans font-bold">{t("⚠️ Warning: Testing is NOT free!", "⚠️ Peringatan: Pengujian ini TIDAK gratis!")}</p>
                      <p className="m-0 mt-2 text-sm text-red font-sans">
                        {t("Testing via the Web Playground triggers a real transaction on the Escrow Smart Contract. Your tMON balance will be deducted to pay the AI Provider for their computation.", "Pengujian via Web Playground memicu transaksi nyata di Escrow Smart Contract. Saldo tMON kamu akan dipotong untuk membayar Penyedia AI atas komputasi mereka.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Global Note */}
            <div className="mt-12 pt-8 border-t-[3px] border-dashed border-mut">
              <p className="text-lg text-ink font-sans m-0 text-center">
                <strong>{t("Behind the scenes:", "Di balik layar:")}</strong> {t("Regardless of which method you choose, our Gateway automatically verifies your tMON balance, locks it in the Escrow Smart Contract, forwards your prompt to the AI provider, and pays them instantly when they reply.", "Apapun metode yang kamu pilih, Gateway kami secara otomatis memverifikasi saldo tMON kamu, menguncinya di Escrow Smart Contract, meneruskan prompt ke penyedia AI, dan langsung membayar mereka saat mereka membalas.")}
              </p>
            </div>
            
          </div>
        </section>

        {/* Stopwatch Challenge */}
        {activeTab === 'mcp' && (
          <section className="bg-yel border-[3px] border-solid border-ink p-8 md:p-12 rounded-[30px_8px_30px_8px] shadow-sm transform -rotate-1 mx-auto max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-8 mt-4 relative overflow-hidden animate-fade-in">
            <div className="absolute right-[-20px] bottom-[-40px] opacity-20 pointer-events-none">
              <Sv id="monkey" w={220} />
            </div>
            <div className="relative z-10 text-center md:text-left max-w-lg">
              <h2 className="text-4xl md:text-5xl mb-2 text-[#2a2a4a]">{t("Speedrun Challenge", "Tantangan Cepat")}</h2>
              <p className="text-xl text-[#2a2a4a] m-0 font-sans font-medium opacity-80">
                {t("We claim you can connect your agent in under 2 minutes. Prove us wrong!", "Kami mengklaim kamu bisa menghubungkan agenmu di bawah 2 menit. Buktikan kalau kami salah!")}
              </p>
            </div>
            <div className="bg-paper border-[3px] border-solid border-ink p-6 rounded-[16px_4px_16px_4px] flex flex-col items-center justify-center min-w-[220px] relative z-10 rotate-2 shadow-crayon">
              <div className="font-mono text-5xl font-bold text-red mb-4">{swt}s</div>
              <button className={`btn !text-xl !w-full !py-3 ${sw ? "b-r" : "b-g"}`} onClick={handleSw}>
                {sw ? t("Stop", "Berhenti") : t("Start clock", "Mulai")}
              </button>
              <p className="text-sm font-sans font-bold text-mut m-0 mt-3">{t("Goal: < 120s", "Target: < 120dtk")}</p>
            </div>
          </section>
        )}

      </main>
    </>
  );
}

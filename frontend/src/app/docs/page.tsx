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
  const [listingName, setListingName] = useState<string>("Text Extraction");
  const [activeTab, setActiveTab] = useState<'mcp' | 'playground'>('mcp');
  const [mcpClient, setMcpClient] = useState<'claude' | 'cursor' | 'vscode'>('claude');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
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
          const pref = data.find((d: any) => d.name === 'Text Extraction') || data.find((d: any) => d.name === 'JSON Formatter') || data[0];
          setListingId(pref.id);
          setListingName(pref.name);
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

  const handleCopyPrompt = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(id);
      setTimeout(() => setCopiedPrompt(null), 2000);
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
            <h1 className="text-5xl md:text-6xl mb-4">{t("How it Works", "Cara Kerja")}</h1>
            <p className="text-xl text-mut leading-relaxed m-0">
              {t("MicroMinds powers the Autonomous AI Agent Economy on Monad. Give your AI Agents (Claude Desktop, Cursor, VS Code) direct access to discover, negotiate, and settle decentralized micro-services via the Model Context Protocol (MCP) backed by Monad Smart Contract Escrow.", "MicroMinds menggerakkan Ekonomi Agen AI Otonom di Monad. Berikan agen AI mu (Claude Desktop, Cursor, VS Code) akses langsung untuk mencari, menawar, dan menyelesaikan transaksi micro-services terdesentralisasi lewat Model Context Protocol (MCP) yang dijamin Smart Contract Escrow Monad.")}
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
              🤖 {t("For Autonomous AI Agents (MCP)", "Untuk Agen AI Otonom (MCP)")}
            </button>
            <button 
              className={`btn !text-lg !px-6 !py-3 ${activeTab === 'playground' ? 'b-g' : 'b-w'}`}
              onClick={() => setActiveTab('playground')}
            >
              🕹️ {t("Web Playground Sandbox", "Web Playground Sandbox")}
            </button>
          </div>

          <div className="card !p-6 md:!p-12 relative">
            
            {/* TAB 1: MCP */}
            {activeTab === 'mcp' && (
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl mb-4 text-center">{t("The Model Context Protocol (MCP) Standard", "Standar Model Context Protocol (MCP)")}</h2>
                <p className="text-lg text-mut font-sans text-center mb-8 max-w-2xl mx-auto">
                  {t("Use Model Context Protocol (MCP) to let your AI Agents automatically discover, negotiate, and pay for APIs on Monad with trustless escrow.", "Gunakan Model Context Protocol (MCP) agar Agen AI kamu bisa otomatis mencari, menawar, dan membayar API di Monad dengan trustless escrow.")}
                </p>

                {/* Sub Client Tabs */}
                <div className="flex justify-center gap-3 mb-8">
                  <button 
                    className={`btn !py-2 !px-4 !text-base ${mcpClient === 'claude' ? 'b-b' : 'b-w'}`}
                    onClick={() => setMcpClient('claude')}
                  >
                    🟣 Claude Desktop
                  </button>
                  <button 
                    className={`btn !py-2 !px-4 !text-base ${mcpClient === 'cursor' ? 'b-b' : 'b-w'}`}
                    onClick={() => setMcpClient('cursor')}
                  >
                    ⚡ Cursor IDE
                  </button>
                  <button 
                    className={`btn !py-2 !px-4 !text-base ${mcpClient === 'vscode' ? 'b-b' : 'b-w'}`}
                    onClick={() => setMcpClient('vscode')}
                  >
                    💻 VS Code & CLI
                  </button>
                </div>

                {/* Step 1: Config */}
                <div className="flex gap-6 md:gap-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm rotate-2">1</div>
                    <div className="w-[3px] h-full bg-ink opacity-20 border-l-[3px] border-dashed border-ink mt-4"></div>
                  </div>
                  <div className="flex-1 min-w-0 pb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <h3 className="text-3xl m-0">
                        {mcpClient === 'claude' && t("Add Config to Claude Desktop", "Tambahkan Config ke Claude Desktop")}
                        {mcpClient === 'cursor' && t("Add Config to Cursor", "Tambahkan Config ke Cursor")}
                        {mcpClient === 'vscode' && t("Add Config to VS Code / Cline", "Tambahkan Config ke VS Code / Cline")}
                      </h3>
                      <button className="btn b-b !py-2 !px-5 !text-lg shrink-0 w-full sm:w-auto" onClick={handleCopy}>
                        {copied ? t("Copied! ✅", "Tersalin! ✅") : t("Copy config", "Salin config")}
                      </button>
                    </div>

                    {mcpClient === 'claude' && (
                      <p className="text-base text-mut mb-4 mt-0 font-sans">
                        {t("In Claude Desktop, click menu ", "Di Claude Desktop, klik menu ")}<strong>Claude ➡️ Settings ➡️ Developer ➡️ Edit Config</strong>. {t("Paste the JSON below into ", "Tempel JSON di bawah ke dalam file ")}<code>claude_desktop_config.json</code>.
                      </p>
                    )}

                    {mcpClient === 'cursor' && (
                      <p className="text-base text-mut mb-4 mt-0 font-sans">
                        {t("In your project, save this as ", "Di proyek kamu, simpan ini sebagai ")}<code>.cursor/mcp.json</code>{t(" or go to ", " atau buka ")}<strong>Cursor Settings ➡️ Features ➡️ MCP</strong>.
                      </p>
                    )}

                    {mcpClient === 'vscode' && (
                      <p className="text-base text-mut mb-4 mt-0 font-sans">
                        {t("Use Cline or Claude Code extension, then paste this into the MCP Server settings.", "Gunakan ekstensi Cline atau Claude Code, lalu tempel ini di pengaturan MCP Server.")}
                      </p>
                    )}

                    <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
                      {cfg}
                    </pre>
                  </div>
                </div>

                {/* Step 2: Restart */}
                <div className="flex gap-6 md:gap-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm -rotate-2">2</div>
                    <div className="w-[3px] h-full bg-ink opacity-20 border-l-[3px] border-dashed border-ink mt-4"></div>
                  </div>
                  <div className="flex-1 min-w-0 pb-12">
                    <h3 className="text-3xl m-0 mb-2">{t("Restart Your Client", "Restart Aplikasi Kamu")}</h3>
                    <p className="text-base text-mut m-0 font-sans">
                      {t("Close and restart your application (press Cmd + Q on macOS) to load the new MCP server. You will see 3 official tools (check_balance, search_api, call_api) ready to use!", "Tutup dan restart aplikasimu (tekan Cmd + Q di macOS) untuk memuat server MCP baru. 3 tools resmi (check_balance, search_api, call_api) akan langsung siap digunakan!")}
                    </p>
                  </div>
                </div>

                {/* Step 3: Tested Prompts */}
                <div className="flex gap-6 md:gap-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm rotate-2">3</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl m-0 mb-2">{t("Try Ready-to-Use Prompts", "Coba Prompt Siap Pakai")}</h3>
                    <p className="text-base text-mut mb-6 font-sans">
                      {t("Copy and paste any of these tested natural language prompts into your AI chat:", "Salin dan tempel salah satu prompt bahasa alami ini langsung ke chat AI kamu:")}
                    </p>

                    <div className="flex flex-col gap-4">
                      {/* Prompt 1 */}
                      <div className="bg-paper border-[3px] border-dashed border-mut p-4 md:p-5 rounded-[12px_4px_12px_4px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <span className="font-bold text-ink block mb-1">🔍 {t("Prompt A: Service Discovery", "Prompt A: Pencarian Layanan")}</span>
                          <p className="font-mono text-xs md:text-sm text-ink m-0">"Please search the MicroMinds marketplace for available AI tools and API services on Monad."</p>
                        </div>
                        <button 
                          className="btn b-w !py-1 !px-3 !text-sm shrink-0"
                          onClick={() => handleCopyPrompt("Please search the MicroMinds marketplace for available AI tools and API services on Monad.", "p1")}
                        >
                          {copiedPrompt === "p1" ? t("Copied! ✅", "Tersalin! ✅") : t("Copy", "Salin")}
                        </button>
                      </div>

                      {/* Prompt 2 */}
                      <div className="bg-paper border-[3px] border-dashed border-mut p-4 md:p-5 rounded-[12px_4px_12px_4px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <span className="font-bold text-ink block mb-1">💳 {t("Prompt B: Autonomous Balance Awareness (New!)", "Prompt B: Cek Saldo tMON Otonom (Baru!)")}</span>
                          <p className="font-mono text-xs md:text-sm text-ink m-0">"Please check my available tMON balance on MicroMinds to see if I have enough funds for micro-API calls."</p>
                        </div>
                        <button 
                          className="btn b-w !py-1 !px-3 !text-sm shrink-0"
                          onClick={() => handleCopyPrompt("Please check my available tMON balance on MicroMinds to see if I have enough funds for micro-API calls.", "p_bal")}
                        >
                          {copiedPrompt === "p_bal" ? t("Copied! ✅", "Tersalin! ✅") : t("Copy", "Salin")}
                        </button>
                      </div>

                      {/* Prompt 3 */}
                      <div className="bg-paper border-[3px] border-dashed border-mut p-4 md:p-5 rounded-[12px_4px_12px_4px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <span className="font-bold text-ink block mb-1">⚡ {t("Prompt C: Contact & Lead Extraction (Pay-per-use)", "Prompt C: Ekstraksi Kontak & Lead")}</span>
                          <p className="font-mono text-xs md:text-sm text-ink m-0">"Morning! Can you search MicroMinds for an API on Monad, and buy/call it to extract emails and phone numbers from: 'Hey! Contact our team at partnerships@innovatecorp.com or +1-800-555-0199'?"</p>
                        </div>
                        <button 
                          className="btn b-w !py-1 !px-3 !text-sm shrink-0"
                          onClick={() => handleCopyPrompt("Morning! Can you search MicroMinds for an API on Monad, and buy/call it to extract emails and phone numbers from: 'Hey! Contact our team at partnerships@innovatecorp.com or +1-800-555-0199'?", "p2")}
                        >
                          {copiedPrompt === "p2" ? t("Copied! ✅", "Tersalin! ✅") : t("Copy", "Salin")}
                        </button>
                      </div>

                      {/* Prompt 4 */}
                      <div className="bg-paper border-[3px] border-dashed border-mut p-4 md:p-5 rounded-[12px_4px_12px_4px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <span className="font-bold text-ink block mb-1">🔗 {t("Prompt D: OpenGraph Link Preview", "Prompt D: Preview Link OpenGraph")}</span>
                          <p className="font-mono text-xs md:text-sm text-ink m-0">"In index.html, borrow the URL Metadata API from MicroMinds to generate preview card details for 'https://monad.xyz' on Monad testnet."</p>
                        </div>
                        <button 
                          className="btn b-w !py-1 !px-3 !text-sm shrink-0"
                          onClick={() => handleCopyPrompt("In index.html, borrow the URL Metadata API from MicroMinds to generate preview card details for 'https://monad.xyz' on Monad testnet.", "p3")}
                        >
                          {copiedPrompt === "p3" ? t("Copied! ✅", "Tersalin! ✅") : t("Copy", "Salin")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Escrow Guarantee Callout */}
                <div className="mt-10 p-5 md:p-6 bg-[#836EF9]/10 border-[3px] border-solid border-[#836EF9] rounded-[16px_4px_16px_4px]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🛡️</span>
                    <h4 className="text-xl md:text-2xl m-0 font-bold text-ink">
                      {t("Zero-Risk Escrow Guarantee on Monad", "Jaminan Escrow Bebas Risiko di Monad")}
                    </h4>
                  </div>
                  <p className="font-sans text-sm md:text-base text-mut m-0 leading-relaxed">
                    {t("Unlike traditional Web2 APIs where failed calls still consume your budget, MicroMinds uses trustless Smart Contract Escrow. If a provider returns a non-2xx status (e.g. HTTP 500) or times out, the smart contract automatically executes a 100% on-chain refund to your wallet instantly!", "Berbeda dengan API Web2 biasa di mana pemanggilan gagal tetap memakan kuota/uang, MicroMinds menggunakan Smart Contract Escrow terdesentralisasi. Jika penyedia API mengembalikan status gagal (seperti HTTP 500) atau timeout, smart contract secara otomatis me-refund saldo token MON kamu 100% on-chain seketika!")}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Playground */}
            {activeTab === 'playground' && (
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl mb-4 text-center">{t("Web Playground & Manual Sandbox", "Web Playground & Sandbox Manual")}</h2>
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

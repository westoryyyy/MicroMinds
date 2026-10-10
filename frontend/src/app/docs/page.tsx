"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useApiKey } from "@/lib/hooks";
import { CFG } from "@/lib/config";
import { Sv } from "@/components/Crayon";

export default function DocsPage() {
  const { key } = useApiKey();
  const [sw, setSw] = useState(false);
  const [swt, setSwt] = useState("0.0");
  const [swi, setSwi] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);

  const k = key || "mm_log_in_to_get_your_key";
  const cfg = JSON.stringify({
    mcpServers: {
      microminds: {
        command: "node",
        args: ["packages/mcp-server/dist/index.js"],
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
      alert("Select the text and copy it by hand.");
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
            <h1 className="text-5xl md:text-6xl mb-4">Connect MCP in 2 minutes</h1>
            <p className="text-xl text-mut leading-relaxed m-0">
              Give your AI agent access to the MicroMinds Escrow protocol via the Model Context Protocol (MCP). Cursor, Claude Desktop, and others are supported.
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
        
        {/* Timeline Steps */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="card !p-6 md:!p-12 relative">
            
            {/* Step 1 */}
            <div className="flex gap-6 md:gap-8">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm -rotate-3">1</div>
                <div className="w-[3px] h-full bg-ink opacity-20 border-l-[3px] border-dashed border-ink mt-4"></div>
              </div>
              <div className="flex-1 min-w-0 pb-16">
                <h3 className="text-3xl m-0 mb-2">Get the Server</h3>
                <p className="text-lg text-mut mb-4 mt-0 font-sans">Clone the repository and build the MCP server package locally.</p>
                <div className="relative">
                  <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
{`git clone <your repo>
cd microminds/packages/mcp-server
npm i && npm run build`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 md:gap-8">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm rotate-2">2</div>
                <div className="w-[3px] h-full bg-ink opacity-20 border-l-[3px] border-dashed border-ink mt-4"></div>
              </div>
              <div className="flex-1 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <h3 className="text-3xl m-0">Add Config to Cursor</h3>
                  <button className="btn b-b !py-2 !px-5 !text-lg shrink-0 w-full sm:w-auto" onClick={handleCopy}>
                    {copied ? "Copied! ✅" : "Copy config"}
                  </button>
                </div>
                <p className="text-lg text-mut mb-4 mt-0 font-sans">
                  {key ? "Filled with your API key." : <><Link href="/dashboard" className="text-blu font-bold">Log in and create a key</Link> to fill it in automatically.</>}
                </p>
                <pre className="!bg-[#151520] !text-[#f4efe0] !border-[3px] !border-solid !border-ink !rounded-[12px_4px_12px_4px] !p-5 shadow-inner overflow-x-auto text-sm md:text-base font-mono leading-relaxed m-0">
                  {cfg}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 md:gap-8">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-yel border-[3px] border-solid border-ink text-ink flex items-center justify-center font-bold text-3xl font-gochi z-10 shadow-sm -rotate-2">3</div>
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <h3 className="text-3xl m-0 mb-2">Restart & Test</h3>
                <p className="text-lg text-mut mb-4 mt-0 font-sans">
                  Restart your IDE, open the chat, and type a prompt like:
                </p>
                <div className="bg-paper border-[3px] border-dashed border-mut p-4 md:p-6 rounded-[12px_4px_12px_4px] text-center mb-4">
                  <span className="font-sans text-ink font-medium md:text-lg">"Find an API that tidies JSON, then use it on <code className="bg-card text-blu px-2 py-1 border border-solid border-mut rounded text-sm md:text-base">{`{a:1,b:[2,3]}`}</code>"</span>
                </div>
                <p className="text-lg text-mut m-0 font-sans">
                  The agent will automatically map tools: it calls <b className="text-ink">search_api</b> to find a provider, then <b className="text-ink">call_api</b>, and will report back the status and transaction hash.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Stopwatch Challenge */}
        <section className="bg-yel border-[3px] border-solid border-ink p-8 md:p-12 rounded-[30px_8px_30px_8px] shadow-sm transform -rotate-1 mx-auto max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-8 mt-4 relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-40px] opacity-20 pointer-events-none">
            <Sv id="monkey" w={220} />
          </div>
          <div className="relative z-10 text-center md:text-left max-w-lg">
            <h2 className="text-4xl md:text-5xl mb-2 text-[#2a2a4a]">Speedrun Challenge</h2>
            <p className="text-xl text-[#2a2a4a] m-0 font-sans font-medium opacity-80">
              We claim you can connect your agent in under 2 minutes. Prove us wrong!
            </p>
          </div>
          <div className="bg-paper border-[3px] border-solid border-ink p-6 rounded-[16px_4px_16px_4px] flex flex-col items-center justify-center min-w-[220px] relative z-10 rotate-2 shadow-crayon">
            <div className="font-mono text-5xl font-bold text-red mb-4">{swt}s</div>
            <button className={`btn !text-xl !w-full !py-3 ${sw ? "b-r" : "b-g"}`} onClick={handleSw}>
              {sw ? "Stop" : "Start clock"}
            </button>
            <p className="text-sm font-sans font-bold text-mut m-0 mt-3">Goal: &lt; 120s</p>
          </div>
        </section>

      </main>
    </>
  );
}

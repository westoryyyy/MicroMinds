"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useApiKey } from "@/lib/hooks";
import { CFG } from "@/lib/config";

export default function DocsPage() {
  const { key } = useApiKey();
  const [sw, setSw] = useState(false);
  const [swt, setSwt] = useState("0.0");
  const [swi, setSwi] = useState<NodeJS.Timeout | null>(null);

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
      alert("Config copied");
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
    <div className="wrap">
      <section>
        <h2>Connect your agent in under 2 minutes</h2>
        <div className="card">
          <h3>1. Get the MCP server</h3>
          <pre>
            git clone &lt;your microminds repo&gt;{`\n`}
            cd microminds/packages/mcp-server && npm i && npm run build
          </pre>

          <h3>2. Copy your config</h3>
          <p className="mut">
            {key ? "Filled with your API key." : <><Link href="/dashboard">Log in and create a key</Link> to fill it in automatically.</>}
          </p>
          <pre id="cfg">{cfg}</pre>
          <button className="btn b-b" onClick={handleCopy}>Copy config</button>

          <h3 style={{ marginTop: 24 }}>3. Restart Cursor and try it</h3>
          <pre>Find an API that tidies JSON, then use it on {`{a:1,b:[2,3]}`}</pre>
          <p>The agent calls <b>search_api</b>, then <b>call_api</b>, and reports the payment status and tx hash.</p>
          
          <p style={{ marginTop: 24 }}>
            Test with a friend:{" "}
            <button className="btn" onClick={handleSw}>
              {sw ? "Stop stopwatch" : "Start stopwatch"}
            </button>{" "}
            <b>{swt}s</b> (goal: under 120s)
          </p>
        </div>
      </section>
    </div>
  );
}

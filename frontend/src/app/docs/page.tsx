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

      <section style={{ marginTop: 40 }}>
        <h2>User Guide: How to actually use this? (The GoFood Way)</h2>
        <div className="card">
          <p>Confused about how this works? Think of MicroMinds like ordering GoFood using GoPay, but for AI Agents!</p>
          
          <h3 style={{ marginTop: 24 }}>Step 1: Top-up your GoPay (Deposit)</h3>
          <p>You log in to the MicroMinds website, go to your Dashboard, and <b>Deposit tMON</b> into the Escrow contract. You will automatically receive a secret <b>API Key</b> (your PIN).</p>

          <h3 style={{ marginTop: 24 }}>Step 2: Plug into your Cursor Editor</h3>
          <p>Copy the JSON configuration from Step 2 above. Open your <b>Cursor</b> application (or Windsurf), go to <i>Settings &gt; Features &gt; MCP</i>, and paste the JSON there. This connects your AI code editor directly to MicroMinds.</p>

          <h3 style={{ marginTop: 24 }}>Step 3: Tell your AI to order! (Prompting)</h3>
          <p>You do NOT type commands in a terminal or click buttons on a website anymore. Instead, open the chat inside Cursor and just tell your AI (like Claude) what you need in plain English!</p>
          <pre>
            "Hey Claude, can you use MicroMinds to format this messy JSON file for me?"
          </pre>
          
          <h3 style={{ marginTop: 24 }}>Step 4: The Magic happens in the background</h3>
          <p>
            Claude (inside Cursor) will secretly talk to the MicroMinds Backend using your API Key. The Backend deducts (reserves) 0.0001 tMON from your balance, tells the JSON Formatter provider to do the job, pays them, and sends the beautiful formatted JSON straight back into your Cursor chat. <b>Magic! ✨</b>
          </p>
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Developer Guide: Escrow Smart Contract Flow</h2>
        <div className="card">
          <p>This is a quick explanation of how payments flow in the MicroMinds Smart Contract so you don't get lost debugging!</p>
          
          <h3 style={{ marginTop: 24 }}>The Three Roles</h3>
          <ul>
            <li><strong>Consumer (User):</strong> You! You deposit tMON into the Escrow contract via the website.</li>
            <li><strong>Provider (AI/API):</strong> The seller who registers their API and gets paid in tMON for every successful call.</li>
            <li><strong>Operator (Backend):</strong> The trusted referee (our backend API). The backend holds the <i>Deployer's Private Key</i> to securely execute transactions on behalf of users without needing users to sign MetaMask popups every 2 seconds.</li>
          </ul>

          <h3 style={{ marginTop: 24 }}>The Transaction Flow</h3>
          <ol>
            <li><strong>1. Reserve (Lock):</strong> When a Consumer's AI requests a service, the Backend calls <code>reserve()</code> on the smart contract. This locks the exact amount of tMON from the Consumer's balance for this specific API request.</li>
            <li><strong>2. Call API:</strong> The Backend calls the Provider's actual AI/API endpoint (like OpenRouter).</li>
            <li><strong>3. Release (Success):</strong> If the AI responds successfully, the Backend calls <code>release()</code> on the smart contract. The locked tMON is immediately transferred to the Provider's balance.</li>
            <li><strong>4. Refund (Failure):</strong> If the AI is down, times out, or returns a 500 error, the Backend automatically calls <code>refund()</code> to return the locked tMON back to the Consumer.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

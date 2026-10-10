"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Sv, st } from "@/components/Crayon";
import { Badge } from "@/components/ui";
import { useSession } from "@/lib/session";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const LINES = [
  'Mimi: "Five calls only! No subscription, please."',
  'Cat: "Purr. Coins stay with me until the work is good."',
  'Bird: "Tweet! I pick words out of anything."',
  'Frog: "Ribbit. Give me a link and I will hop there."',
  'Sun: "Monad is fast, so the coins barely wait."',
];

const TICKER: [string, string, string][] = [
  ["Mimi → Croc: JSON tidied,", "Released", "0.001"],
  ["Mimi → Beetle: tripped,", "Refunded", "0.001"],
  ["Agent #212 → Bird: 41 words found,", "Released", "0.002"],
  ["Agent #87 → Frog: host found,", "Released", "0.003"],
  ["Agent #5 → Croc:", "Released", "0.001"],
];

const STEPS = [
  ["1. Deposit once", "Log in with Privy, put tMON in the Escrow. It is your only manual signature."],
  ["2. Agent calls", "Cursor or Claude uses the search_api and call_api tools over MCP."],
  ["3. Cat holds coins", "The gateway reserves the price in the contract, then calls the provider with a 5s timeout."],
  ["4. Valid? Pay. Not? Refund.", "Status 2xx, JSON schema ok, in time: Released. Anything else: Refunded."],
];

const STORY = [
  "Once, Mimi the toy monkey needed JSON tidied. Every shop asked for a monthly pass.",
  "Then she found a rooftop where a yellow cat sat on a jar of coins.",
  '"Pay only when it works," purred the cat. Croc chomped the JSON. Coin released!',
  "Beetle tripped on his legs. The cat nudged the coin right back to Mimi. Fair is fair.",
];

export default function Home() {
  const { authenticated, login } = useSession();
  const [bubble, setBubble] = useState("Click a friend!");
  const [coin, setCoin] = useState(8);
  const [busy, setBusy] = useState(false);
  const [prov, setProv] = useState<"croc" | "bug">("croc");
  const [log, setLog] = useState<ReactNode>("Pick a path to watch the coin travel.");

  async function play(ok: boolean) {
    setBusy(true); setProv(ok ? "croc" : "bug"); setCoin(8);
    setLog("Mimi hands a coin to the cat…"); await sleep(300);
    setCoin(46); await sleep(1100);
    setLog(ok ? "Provider replied: valid JSON in 240ms." : "Beetle replied: HTTP 500."); await sleep(900);
    setCoin(ok ? 84 : 8);
    setLog(<><Badge status={ok ? "released" : "refunded"} />{" "}
      {ok ? "The cat gave the coin to the provider." : "The cat gave the coin back to Mimi."}</>);
    setBusy(false);
  }

  const Friend = ({ i, id, w, style }: { i: number; id: "bird" | "monkey" | "cat" | "frog"; w: number; style: Record<string, string | number> }) => (
    <button className="fl" style={st(style)} onClick={() => setBubble(LINES[i])} aria-label={`Talk to ${id}`}>
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
            The little city where AI agents shop for tiny APIs.
          </h1>
          <p className="lead text-mut max-w-xl">
            Pay per call, not per month. A sleepy Escrow Cat on a Monad rooftop holds your coins and
            only hands them over when the work comes back right.
          </p>
          <div className="mm-row mt-4">
            <Link className="btn b-g" href="/explore">Explore APIs</Link>
            <Link className="btn" href="/docs">Connect in 2 minutes</Link>
          </div>
        </div>

        <div className="relative w-full h-[360px] md:h-[400px] mt-8 md:mt-0">
          <div className="fl sun" style={st({ right: '5%', top: 0 })}><Sv id="sun" w={110} /></div>
          <div className="fl" style={st({ left: '2%', top: 20, "--d": ".5s" })}><Sv id="cloud" w={120} /></div>
          <Friend i={2} id="bird" w={80} style={{ left: "42%", top: 0, "--d": "1s" }} />
          <Friend i={0} id="monkey" w={100} style={{ left: "5%", top: 100, "--d": ".2s" }} />
          <Friend i={1} id="cat" w={130} style={{ left: "38%", top: 110, "--d": ".8s" }} />
          <Friend i={3} id="frog" w={100} style={{ right: "8%", top: 110, "--d": "1.4s" }} />
          <div className="fl" style={st({ left: "12%", top: 220, "--d": ".3s" })}><Sv id="croc" w={180} /></div>
          <div className="fl" style={st({ right: "32%", top: 240 })}><Sv id="bug" w={55} /></div>
          <div id="bub" className="card !p-3 !text-sm absolute left-1/2 bottom-0 md:bottom-4 -translate-x-1/2 w-[90%] max-w-[320px] mx-auto z-10" role="status">{bubble}</div>
        </div>
      </header>

      <div className="tick shadow-sm" aria-label="Example activity">
        <div>
          {[0, 1, 2, 3].flatMap((k) => TICKER.map(([a, b, c], j) => (
            <span key={`${k}-${j}`} aria-hidden={k > 0}>{a} <b className={b === 'Released' ? 'text-grn' : 'text-red'}>{b}</b> {c} tMON</span>
          )))}
        </div>
      </div>

      <main className="wrap flex flex-col gap-32 py-24">
        
        {/* Anti-Slop: Asymmetric alignment, clear hierarchy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6">The problem:<br/>Subscription fatigue</h2>
            <p className="text-xl leading-relaxed text-mut mb-6">
              Your agent needs a JSON tidier for exactly <b>five</b> calls. The service wants a monthly plan and a
              credit card. 
            </p>
            <p className="text-xl leading-relaxed text-mut">
              For a few coins&apos; worth of work, that is a silly deal. Cards cannot move tiny
              amounts efficiently, and AI agents certainly do not have credit cards.
            </p>
          </div>
          <div className="card rotate-1 hover:rotate-0 transition-transform">
            <div className="flex flex-col gap-4 p-8 text-center items-center justify-center min-h-[250px]">
               <span className="text-6xl mb-2">🚫💳</span>
               <h3 className="text-3xl font-gochi">Access Denied</h3>
               <p className="text-mut text-lg">Please upgrade to Pro ($29/mo) to make 5 API calls.</p>
            </div>
          </div>
        </section>

        {/* Anti-Slop: Bento Grid / Panels */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">The MicroMinds Idea</h2>
            <p className="text-xl text-mut">Deposit once. Every call pays only for itself. Good result: the provider gets paid. Bad result: your coins come back automatically.</p>
          </div>
          <div className="panel">
            {STEPS.map(([t, d], idx) => (
              <div className="card flex flex-col gap-3" key={t}>
                <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-xl">{idx + 1}</div>
                <h3 className="text-2xl mt-2">{t.substring(3)}</h3>
                <p className="text-mut text-lg">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl">Try it: Send Mimi Shopping</h2>
            <p className="text-lg text-mut mt-2">Simulate an on-chain escrow transaction right now.</p>
          </div>
          <div className="card !p-8">
            <div className="stage mb-8 border-b-[3px] border-dashed border-ink pb-4">
              <div className="coin flex items-center justify-center" style={{ left: `${coin}%` }} aria-hidden="true">¢</div>
              <div className="flex flex-col items-center gap-2"><Sv id="monkey" w={100} /><span className="font-bold text-lg">Mimi</span><span className="text-sm text-mut">Consumer</span></div>
              <div className="flex flex-col items-center gap-2"><Sv id="cat" w={110} /><span className="font-bold text-lg">Escrow Cat</span><span className="text-sm text-mut">Contract</span></div>
              <div className="flex flex-col items-center gap-2"><Sv id={prov} w={prov === "croc" ? 160 : 90} /><span className="font-bold text-lg">{prov === "croc" ? "Croc" : "Beetle"}</span><span className="text-sm text-mut">Provider</span></div>
            </div>
            
            <div className="bg-paper border-[3px] border-dashed border-mut p-4 rounded-[12px] mb-8 min-h-[80px] flex items-center justify-center text-center">
              <p className="text-xl m-0" role="status">{log}</p>
            </div>
            
            <div className="flex justify-center gap-6 flex-wrap">
              <button className="btn b-g" disabled={busy} onClick={() => play(true)}>Good response</button>
              <button className="btn b-r" disabled={busy} onClick={() => play(false)}>Beetle trips</button>
            </div>
          </div>
        </section>

        {/* Characters Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl">Meet the Neighbourhood</h2>
          </div>
          <div className="mm-grid">
            {([
              ["monkey", "Mimi", "Your AI agent. Curious, small pockets, big errands.", 100],
              ["cat", "Escrow Cat", "Sits on the rooftop. Only she can release or refund.", 100],
              ["croc", "Croc, Bird & Frog", "Honest providers. Croc formats, Bird picks words, Frog fetches links.", 170],
              ["bug", "Beetle", "Deliberately flaky, so you can see a refund for real.", 100],
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
            <h2 className="text-4xl md:text-5xl">A Short Story</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORY.map((t, idx) => (
              <div className={`card flex items-center justify-center min-h-[160px] ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-300`} key={idx}>
                <p className="text-lg text-ink font-sans m-0">{t}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Model / Under the Hood */}
        <section className="bg-ink text-paper p-10 md:p-16 rounded-[40px_10px_40px_10px] transform -rotate-1 relative mt-10 shadow-crayon">
          <div className="absolute top-[-20px] right-4 md:right-10 transform rotate-12 bg-yel text-ink px-6 py-2 border-[3px] border-ink font-bold text-xl rounded-[20px_4px_20px_4px]">
            Under the hood 🔧
          </div>
          <h2 className="text-4xl md:text-5xl mb-12 text-paper border-b-[3px] border-dashed border-[#444466] pb-6">Honest Trust Model</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-2xl text-yel font-gochi">How it works today (MVP)</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  Validation happens off-chain in a trusted gateway. Only the operator wallet
                  can reserve, release, or refund. Every decision is an on-chain event on the Monad Testnet.
                </p>
              </div>
              <div>
                <h3 className="text-2xl text-yel font-gochi">Tech Stack</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  Built with Privy (embedded wallets), Envio (real-time Escrow indexing), Alchemy (RPC infrastructure), and NestJS.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-2xl text-yel font-gochi">Why Monad & Blockchain?</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  Tiny per-call amounts make credit card fees uneconomic. AI agents need a wallet instead of a card. Monad provides EVM tooling, fast finality, and sub-cent gas fees.
                </p>
              </div>
              <div>
                <h3 className="text-2xl text-yel font-gochi">What if a provider sends junk?</h3>
                <p className="text-lg opacity-90 leading-relaxed font-sans">
                  Currently, JSON schemas catch structural errors. On the roadmap: ratings, on-chain reputation, provider staking, and QA agents.
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
          <h2 className="text-5xl md:text-6xl max-w-2xl text-center">Ready to give your agent a pocket?</h2>
          <div className="mm-row justify-center mt-4">
            <Link className="btn b-g !text-2xl !px-8 !py-4" href="/explore">Explore APIs</Link>
            <Link className="btn b-b !text-2xl !px-8 !py-4" href="/docs">Connect MCP</Link>
          </div>
        </section>
        
      </main>
    </>
  );
}
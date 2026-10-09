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

// Contoh aktivitas statis untuk suasana. Lampiran F: ganti dengan data Envio bila sempat.
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
      <div className="wrap mm-hero">
        <div>
          <h1>The little city where AI agents shop for tiny APIs.</h1>
          <p className="lead">
            Pay per call, not per month. A sleepy Escrow Cat on a Monad rooftop holds your coins and
            only hands them over when the work comes back right.
          </p>
          <div className="mm-row">
            <Link className="btn b-g" href="/explore">Explore APIs</Link>
            <Link className="btn" href="/docs">Connect in 2 minutes</Link>
          </div>
        </div>

        <div className="scene">
          <div className="fl sun" style={st({ right: 0, top: 0 })}><Sv id="sun" w={130} /></div>
          <div className="fl" style={st({ left: 0, top: 20, "--d": ".5s" })}><Sv id="cloud" w={130} /></div>
          <Friend i={2} id="bird" w={90} style={{ left: "36%", top: 0, "--d": "1s" }} />
          <Friend i={0} id="monkey" w={110} style={{ left: "2%", top: 110, "--d": ".2s" }} />
          <Friend i={1} id="cat" w={130} style={{ left: "36%", top: 130, "--d": ".8s" }} />
          <Friend i={3} id="frog" w={110} style={{ right: "6%", top: 170, "--d": "1.4s" }} />
          <div className="fl" style={st({ left: "4%", bottom: 40, "--d": ".3s" })}><Sv id="croc" w={200} /></div>
          <div className="fl" style={st({ right: "30%", bottom: 20 })}><Sv id="bug" w={60} /></div>
          <div id="bub" className="card" role="status">{bubble}</div>
        </div>
      </div>

      <div className="tick" aria-label="Example activity">
        <div>
          {[0, 1, 2, 3].flatMap((k) => TICKER.map(([a, b, c], j) => (
            <span key={`${k}-${j}`} aria-hidden={k > 0}>{a} <b>{b}</b> {c}</span>
          )))}
        </div>
      </div>

      <div className="wrap">
        <section>
          <h2>The problem: subscription fatigue</h2>
          <div className="card">
            <p>Your agent needs a JSON tidier for <b>five</b> calls. The service wants a monthly plan and a
              credit card. For a few coins&apos; worth of work, that is a silly deal. Cards cannot move tiny
              amounts, and agents do not have cards.</p>
          </div>
        </section>

        <section>
          <h2>The idea</h2>
          <p className="lead">Deposit once. Every call pays only for itself. Good result: the provider gets
            paid. Bad result: your coins come back.</p>
          <div className="panel">
            {STEPS.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section>
          <h2>Try it: send Mimi shopping</h2>
          <div className="card">
            <div className="stage">
              <div className="coin" style={{ left: `${coin}%` }} aria-hidden="true">¢</div>
              <div style={{ textAlign: "center" }}><Sv id="monkey" w={90} /><br />Mimi</div>
              <div style={{ textAlign: "center" }}><Sv id="cat" w={100} /><br />Escrow Cat</div>
              <div style={{ textAlign: "center" }}><Sv id={prov} w={prov === "croc" ? 150 : 80} /><br />Provider</div>
            </div>
            <p role="status">{log}</p>
            <div className="mm-row">
              <button className="btn b-g" disabled={busy} onClick={() => play(true)}>Good response</button>
              <button className="btn b-r" disabled={busy} onClick={() => play(false)}>Beetle trips</button>
            </div>
          </div>
        </section>

        <section>
          <h2>Meet the neighbourhood</h2>
          <div className="mm-grid">
            {([
              ["monkey", "Mimi", "Your AI agent. Curious, small pockets, big errands.", 100],
              ["cat", "Escrow Cat", "Sits on the Monad rooftop. Only the operator whistle can tell her release or refund.", 100],
              ["croc", "Croc, Bird & Frog", "Honest providers. Croc formats, Bird picks words, Frog fetches links.", 170],
              ["bug", "Beetle", "Deliberately flaky, so you can see a refund for real.", 100],
            ] as const).map(([id, n, d, w]) => (
              <div className="card who" key={n}><div><Sv id={id} w={w} /></div><h3>{n}</h3><p>{d}</p></div>
            ))}
          </div>
        </section>

        <section>
          <h2>A short story</h2>
          <div className="panel">{STORY.map((t) => <div className="card" key={t}><p>{t}</p></div>)}</div>
        </section>

        <section>
          <h2>Honest trust model</h2>
          <div className="card">
            <p>In this MVP, validation happens off-chain in a trusted gateway, and only the operator wallet
              can reserve, release or refund. Every decision is an on-chain event. You can withdraw your
              remaining balance any time. Next: multi-party validation, optimistic verification, or TEE.</p>
            <p>Securing AI-to-AI micro-economies with EVM-compatible speed and sub-cent gas fees on Monad Testnet.</p>
            <p><b>Built with</b> Privy (login + embedded wallet), Envio (real-time Escrow indexing), Alchemy (RPC
              infrastructure), on Monad Testnet.</p>
          </div>
          <details><summary>Why blockchain, not a card?</summary>
            <p>Tiny per-call amounts make card fees uneconomic, agents need a wallet instead of a card, and the pay/refund rule is public.</p></details>
          <details><summary>Why Monad?</summary>
            <p>EVM tooling, fast finality and very low gas fit microtransactions.</p></details>
          <details><summary>What if a provider sends junk that matches the schema?</summary>
            <p>Schemas catch structure only. Ratings, on-chain reputation and provider stake are on the roadmap,
              along with QA agents and a platform fee of 2-5%.</p></details>
        </section>

        <section className="cta">
          <div className="fl sun" style={{ position: "static", display: "inline-block" }}><Sv id="sun" w={120} /></div>
          <h2>Ready to give your agent a pocket?</h2>
          <div className="mm-row" style={{ justifyContent: "center" }}>
            <Link className="btn b-g" href="/explore">Explore APIs</Link>
            <Link className="btn b-b" href="/docs">Connect MCP</Link>
          </div>
        </section>
      </div>
    </>
  );
}
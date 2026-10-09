"use client";
import Link from "next/link";
import { useState } from "react";
import { useListings } from "@/lib/hooks";
import { fmtMon, fmtIdr } from "@/lib/format";
import { Sv, type CritterId } from "@/components/Crayon";

const ICONS: CritterId[] = ["croc", "bird", "frog", "monkey", "cat", "bug"];

export function svIdFor(id: string): CritterId {
  let s = 0;
  for (let i = 0; i < id.length; i++) s += id.charCodeAt(i);
  return ICONS[s % ICONS.length];
}

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [mp, setMp] = useState("");
  const { data, isLoading, isError } = useListings({});

  let filtered = data || [];
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter((l) =>
      (l.name + " " + l.description + " " + l.category).toLowerCase().includes(lq)
    );
  }
  if (mp) {
    // max price in tMON, priceWei in wei
    const maxWei = BigInt(Math.round(parseFloat(mp) * 1e18));
    filtered = filtered.filter((l) => BigInt(l.priceWei) <= maxWei);
  }

  return (
    <div className="wrap">
      <section>
        <h2>Explore the shops</h2>
        <div className="mm-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: json, text, link…"
            aria-label="Search"
            style={{ width: "20em" }}
          />
          <select value={mp} onChange={(e) => setMp(e.target.value)} aria-label="Max price">
            <option value="">Any price</option>
            <option value="0.001">≤ 0.001 tMON</option>
            <option value="0.002">≤ 0.002 tMON</option>
            <option value="0.005">≤ 0.005 tMON</option>
          </select>
        </div>

        <div className="mm-grid" style={{ marginTop: 20 }}>
          {isLoading && (
            <>
              <div className="sk"></div><div className="sk"></div><div className="sk"></div>
            </>
          )}
          {isError && (
            <div className="card mm-empty" style={{ gridColumn: "1 / -1" }}>
              <Sv id="cat" w={90} />
              <h3>Error loading shops</h3>
              <p className="err">Could not connect to the backend to fetch listings.</p>
            </div>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="card mm-empty" style={{ gridColumn: "1 / -1" }}>
              <Sv id="cat" w={90} />
              <h3>No shops match</h3>
              <p>Clear the search or raise the price limit.</p>
            </div>
          )}
          {!isLoading && !isError && filtered.map((l) => {
            const s = svIdFor(l.id);
            return (
              <Link key={l.id} href={`/listing/${l.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card who" style={{ cursor: "pointer" }}>
                  <Sv id={s} w={s === "croc" ? 190 : 90} />
                  <h3>{l.name}</h3>
                  <p>{l.description}</p>
                  <p>
                    <span className="chip">{l.category}</span> <b>{fmtMon(l.priceWei)} tMON</b><br />
                    <small className="mut">
                      {fmtIdr(l.priceWei)} (demo rate) · {Math.round(l.successRate || 0)}% success · {l.avgLatencyMs || 0}ms avg
                    </small>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

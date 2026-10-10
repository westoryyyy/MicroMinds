"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/session";
import BalanceChip from "./BalanceChip";

const links = [["/explore", "Explore"], ["/dashboard", "Dashboard"], ["/docs", "Docs"]] as const;

export default function Navbar() {
  const { ready, authenticated, address, login, logout } = useSession();
  const path = usePathname();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="mm-nav" aria-label="Navigasi utama">
      <div className="wrap">
        <Link className="logo" href="/">🖍️ MicroMinds</Link>
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="nl" aria-current={path.startsWith(href) ? "page" : undefined}>
            {label}
          </Link>
        ))}
        {authenticated && <BalanceChip />}
        {authenticated ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span 
              className="chip" 
              style={{ cursor: 'pointer', fontFamily: 'monospace', background: 'var(--card)', color: 'var(--ink)' }} 
              onClick={handleCopy}
              title="Click to copy address"
            >
              {address?.slice(0, 6)}… {copied ? "✅" : "📋"}
            </span>
            <button className="btn b-b" onClick={logout}>Log out</button>
          </div>
        ) : (
          <button className="btn b-b" disabled={!ready} onClick={login}>
            {!ready ? "…" : "Log in"}
          </button>
        )}
      </div>
    </nav>
  );
}
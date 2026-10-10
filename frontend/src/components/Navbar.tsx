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
    <nav className="mm-nav shadow-sm" aria-label="Navigasi utama">
      <div className="wrap !py-4 flex flex-wrap items-center justify-between gap-y-4">
        
        {/* Logo */}
        <Link className="logo group mr-auto" href="/">
          <span className="group-hover:rotate-12 transition-transform inline-block origin-bottom-right">🖍️</span> 
          MicroMinds
        </Link>
        
        {/* Links and Controls */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
          {/* Nav Links */}
          <div className="flex items-center gap-1 md:gap-2">
            {links.map(([href, label]) => {
              const isActive = path.startsWith(href);
              return (
                <Link 
                  key={href} 
                  href={href} 
                  className={`nl !px-3 md:!px-4 !py-1 !border-b-[3px] !border-solid rounded-[8px_4px_8px_4px] transition-colors ${isActive ? '!border-red bg-[#e8322b10]' : '!border-transparent hover:!border-red hover:bg-[#e8322b05]'}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="w-[3px] h-6 bg-ink opacity-20 hidden md:block"></div>

          {/* User Controls */}
          {authenticated ? (
            <div className="flex flex-wrap items-center gap-3">
              <BalanceChip />
              <button 
                className="font-mono text-sm bg-card text-ink border-[2px] border-solid border-ink rounded-[12px_4px_12px_4px] px-3 py-1 cursor-pointer hover:-translate-y-[2px] transition-transform shadow-sm flex items-center gap-2"
                onClick={handleCopy}
                title="Click to copy address"
              >
                <span>{address?.slice(0, 6)}…</span> 
                <span className="text-base">{copied ? "✅" : "📋"}</span>
              </button>
              <button className="btn b-b !py-1 !px-4 !text-base" onClick={logout}>Log out</button>
            </div>
          ) : (
            <button className="btn b-g !py-1 !px-6" disabled={!ready} onClick={login}>
              {!ready ? "…" : "Log in"}
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
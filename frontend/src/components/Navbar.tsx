"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { useLang } from "@/components/LangProvider";
import BalanceChip from "./BalanceChip";

export default function Navbar() {
  const { ready, authenticated, address, login, logout } = useSession();
  const path = usePathname();
  const [copied, setCopied] = useState(false);
  const { lang, setLang, t } = useLang();

  const links = [
    ["/explore", t("Explore", "Eksplor")],
    ["/dashboard", t("Dashboard", "Dasbor")],
    ["/docs", t("Docs", "Dokumen")]
  ] as const;

  const handleCopy = () => {
    navigator.clipboard.writeText(address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  return (
    <nav className="mm-nav shadow-sm sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-[2px] border-dashed border-mut/30" aria-label="Navigasi utama">
      <div className="wrap !py-3 flex flex-wrap items-center justify-between gap-y-4 gap-x-2 md:gap-x-4">
        
        {/* Left Section: Logo & Main Nav */}
        <div className="flex items-center gap-4 md:gap-8 flex-1">
          <Link className="logo group flex items-center gap-2 shrink-0" href="/">
            <img src="/microminds_logo.PNG" alt="MicroMinds Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain group-hover:-rotate-12 transition-transform origin-bottom-left" /> 
            <span className="hidden lg:block text-2xl md:text-3xl">MicroMinds</span>
          </Link>
          
          <div className="flex items-center gap-1 md:gap-2">
            {links.map(([href, label]) => {
              const isActive = path.startsWith(href);
              return (
                <Link 
                  key={href} 
                  href={href} 
                  className={`nl !px-2 md:!px-4 !py-1.5 !text-sm md:!text-lg !border-b-[3px] !border-solid rounded-[8px_4px_8px_4px] transition-colors ${isActive ? '!border-red bg-[#e8322b10]' : '!border-transparent hover:!border-red hover:bg-[#e8322b05]'}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center gap-2 md:gap-4 justify-end shrink-0">
          
          {/* Minimal Lang Toggle */}
          <button 
            onClick={() => setLang(lang === "en" ? "id" : "en")} 
            className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-[12px_4px_12px_4px] hover:bg-black/5 transition-colors border-[2px] border-transparent hover:border-ink/10 text-mut hover:text-ink font-sans font-bold text-xs md:text-sm cursor-pointer"
            title={t("Switch Language", "Ganti Bahasa")}
          >
            <span className="text-base md:text-lg leading-none">🌍</span>
            <span>{lang.toUpperCase()}</span>
          </button>

          <div className="w-[2px] h-6 bg-ink opacity-10 hidden sm:block"></div>

          {/* User Controls */}
          {authenticated ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block">
                <BalanceChip />
              </div>
              <button 
                className="font-mono text-xs md:text-sm bg-card text-ink border-[2px] border-solid border-ink rounded-[12px_4px_12px_4px] px-2 md:px-3 py-1 cursor-pointer hover:-translate-y-[2px] transition-transform shadow-sm flex items-center gap-1.5 md:gap-2"
                onClick={handleCopy}
                title={t("Click to copy address", "Klik untuk menyalin")}
              >
                <span className="hidden sm:inline">{shortAddress}</span>
                <span className="sm:hidden">{address?.slice(0, 6)}…</span>
                <span className="text-sm md:text-base">{copied ? "✅" : "📋"}</span>
              </button>
              <button 
                className="btn b-b !py-1 !px-2 md:!px-4 !text-xs md:!text-base" 
                onClick={logout}
                title={t("Log out", "Keluar")}
              >
                <span className="hidden sm:inline">{t("Log out", "Keluar")}</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          ) : (
            <button className="btn b-g !py-1 !px-4 md:!px-6 !text-sm md:!text-base" disabled={!ready} onClick={login}>
              {!ready ? "…" : t("Log in", "Masuk")}
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
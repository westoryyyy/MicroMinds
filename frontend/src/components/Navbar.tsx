"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { useLang } from "@/components/LangProvider";
import { useTheme } from "@/components/ThemeProvider";
import BalanceChip from "./BalanceChip";

export default function Navbar() {
  const { ready, authenticated, address, login, logout } = useSession();
  const path = usePathname();
  const [copied, setCopied] = useState(false);
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();

  const links = [
    ["/explore", t("Explore", "Eksplor")],
    ["/dashboard", t("Dashboard", "Dasbor")],
    ["/docs", t("How it Works", "Cara Kerja")]
  ] as const;

  const handleCopy = () => {
    navigator.clipboard.writeText(address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  return (
    <nav className="mm-nav shadow-sm sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-[2px] border-dashed border-mut/30" aria-label="Navigasi utama">
      <div className="wrap !py-2.5 flex items-center justify-between gap-2 md:gap-4 flex-nowrap">
        
        {/* Left Section: Logo & Main Nav */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <Link className="logo group !mr-0 flex items-center gap-2 shrink-0" href="/">
            <img src="/microminds_logo.PNG" alt="MicroMinds Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain group-hover:-rotate-12 transition-transform origin-bottom-left" /> 
            <span className="hidden sm:block text-2xl md:text-3xl">MicroMinds</span>
          </Link>
          
          <div className="flex items-center gap-1 md:gap-1.5">
            {links.map(([href, label]) => {
              const isActive = path.startsWith(href);
              return (
                <Link 
                  key={href} 
                  href={href} 
                  className={`nl !px-2 md:!px-3 !py-1 !text-sm md:!text-base !border-b-[3px] !border-solid rounded-[8px_4px_8px_4px] transition-colors ${isActive ? '!border-red bg-[#e8322b10]' : '!border-transparent hover:!border-red hover:bg-[#e8322b05]'}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 justify-end shrink-0">
          
          {/* Theme Mode Toggle (Light / Dark) */}
          <div 
            className="flex items-center bg-card/90 border-[2px] border-solid border-ink/20 rounded-[14px_6px_14px_6px] p-0.5 shadow-sm"
            role="group"
            aria-label={t("Theme selection", "Pilihan tema")}
          >
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-[10px_4px_10px_4px] text-xs font-sans font-bold transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-yel text-[#2a2a4a] shadow-[2px_2px_0_var(--ink)] border border-ink/30"
                  : "text-mut hover:text-ink hover:bg-ink/5 border border-transparent"
              }`}
              title={t("Light Mode", "Mode Terang")}
              aria-pressed={theme === "light"}
            >
              <span className="text-sm leading-none">☀️</span>
              <span className="hidden xl:inline">{t("Light", "Terang")}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-[10px_4px_10px_4px] text-xs font-sans font-bold transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-ink text-paper shadow-[2px_2px_0_var(--yel)] border border-ink/30"
                  : "text-mut hover:text-ink hover:bg-ink/5 border border-transparent"
              }`}
              title={t("Dark Mode", "Mode Gelap")}
              aria-pressed={theme === "dark"}
            >
              <span className="text-sm leading-none">🌙</span>
              <span className="hidden xl:inline">{t("Dark", "Gelap")}</span>
            </button>
          </div>

          {/* Minimal Lang Toggle */}
          <button 
            onClick={() => setLang(lang === "en" ? "id" : "en")} 
            className="flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-[12px_4px_12px_4px] hover:bg-ink/5 transition-colors border-[2px] border-transparent hover:border-ink/10 text-mut hover:text-ink font-sans font-bold text-xs md:text-sm cursor-pointer"
            title={t("Switch Language", "Ganti Bahasa")}
          >
            <span className="text-sm md:text-base leading-none">🌍</span>
            <span>{lang.toUpperCase()}</span>
          </button>

          <div className="w-[2px] h-5 bg-ink opacity-10 hidden sm:block"></div>

          {/* User Controls */}
          {authenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
              <div className="hidden md:block">
                <BalanceChip />
              </div>
              <button 
                className="font-mono text-xs md:text-sm bg-card text-ink border-[2px] border-solid border-ink rounded-[12px_4px_12px_4px] px-2 md:px-2.5 py-1 cursor-pointer hover:-translate-y-[2px] transition-transform shadow-sm flex items-center gap-1.5"
                onClick={handleCopy}
                title={t("Click to copy address", "Klik untuk menyalin")}
              >
                <span className="hidden sm:inline">{shortAddress}</span>
                <span className="sm:hidden">{address?.slice(0, 6)}…</span>
                <span className="text-xs md:text-sm">{copied ? "✅" : "📋"}</span>
              </button>
              <button 
                className="btn b-b !py-1 !px-2.5 md:!px-4 !text-xs md:!text-sm" 
                onClick={logout}
                title={t("Log out", "Keluar")}
              >
                <span className="hidden sm:inline">{t("Log out", "Keluar")}</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          ) : (
            <button className="btn b-g !py-1 !px-3 md:!px-5 !text-xs md:!text-sm" disabled={!ready} onClick={login}>
              {!ready ? "…" : t("Log in", "Masuk")}
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
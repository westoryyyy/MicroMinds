"use client";
import Link from "next/link";
import { useState } from "react";
import { useListings } from "@/lib/hooks";
import { fmtMon, fmtIdr } from "@/lib/format";
import { Sv, type CritterId } from "@/components/Crayon";
import { useLang } from "@/components/LangProvider";

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
  const { t } = useLang();

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
    <>
      {/* Header Section */}
      <header className="wrap py-12 md:py-20 flex flex-col md:flex-row gap-8 justify-between items-end border-b-[3px] border-dashed border-mut">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl mb-4">{t("Explore the Shops", "Eksplor Toko-Toko")}</h1>
          <p className="text-xl text-mut leading-relaxed m-0">
            {t("Find tiny, single-purpose APIs for your agents. No subscriptions, no API key forms. Just pure on-chain escrow per call.", "Temukan API mikro sekali pakai untuk agen Anda. Tanpa langganan, tanpa formulir API key. Murni escrow on-chain per panggilan.")}
          </p>
        </div>
        <div className="hidden md:flex gap-6 pb-2">
          <div className="animate-bob" style={{ animationDelay: '0.2s' }}><Sv id="bird" w={70} /></div>
          <div className="animate-bob" style={{ animationDelay: '0.8s' }}><Sv id="frog" w={80} /></div>
        </div>
      </header>

      <main className="wrap py-12 flex flex-col gap-12">
        {/* Search & Filter Bar */}
        <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-paper border-[3px] border-solid border-ink p-2 md:p-3 shadow-sm rounded-[24px_8px_20px_8px]">
          <div className="flex-1 w-full relative flex items-center">
            <span className="absolute left-4 text-2xl">🔍</span>
            <input
              className="w-full !border-none !shadow-none !pl-12 !py-2 text-xl bg-transparent outline-none focus-visible:!outline-none !rounded-none"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search: json, text, link…", "Cari: json, teks, tautan…")}
              aria-label={t("Search", "Cari")}
            />
          </div>
          <div className="hidden md:block w-[3px] h-10 bg-ink opacity-20"></div>
          <div className="w-full md:w-auto flex items-center gap-4 px-2 bg-card rounded-[14px_4px_12px_4px] border-[3px] border-solid border-ink md:border-none md:bg-transparent p-2 md:p-0">
            <label htmlFor="price-filter" className="font-bold text-lg whitespace-nowrap hidden md:block">{t("Max Price:", "Harga Maks:")}</label>
            <select 
              id="price-filter"
              className="w-full md:w-auto !py-2 !text-lg !bg-transparent !border-none cursor-pointer focus-visible:!outline-none !shadow-none"
              value={mp} 
              onChange={(e) => setMp(e.target.value)} 
              aria-label={t("Max price", "Harga maksimal")}
            >
              <option value="">{t("Any price", "Harga berapapun")}</option>
              <option value="0.001">≤ 0.001 tMON</option>
              <option value="0.002">≤ 0.002 tMON</option>
              <option value="0.005">≤ 0.005 tMON</option>
            </select>
          </div>
        </section>

        {/* Listings Grid */}
        <section>
          <div className="mm-grid">
            {isLoading && (
              <>
                <div className="sk"></div><div className="sk"></div><div className="sk"></div><div className="sk"></div>
              </>
            )}
            {isError && (
              <div className="card mm-empty col-span-full py-16">
                <div className="flex justify-center mb-6"><Sv id="cat" w={120} /></div>
                <h3 className="text-3xl mb-2">{t("Error loading shops", "Gagal memuat toko")}</h3>
                <p className="text-red text-lg">{t("Could not connect to the backend to fetch listings.", "Tidak dapat terhubung ke backend untuk mengambil daftar.")}</p>
              </div>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <div className="card mm-empty col-span-full py-16">
                <div className="flex justify-center mb-6"><Sv id="bug" w={80} /></div>
                <h3 className="text-3xl mb-2">{t("No shops match", "Tidak ada toko yang cocok")}</h3>
                <p className="text-lg text-mut">{t("Clear the search or raise the price limit to find what you need.", "Hapus pencarian atau naikkan batas harga untuk menemukan yang Anda butuhkan.")}</p>
              </div>
            )}
            {!isLoading && !isError && filtered.map((l, idx) => {
              const s = svIdFor(l.id);
              return (
                <Link key={l.id} href={`/listing/${l.id}`} className="no-underline text-ink group">
                  <div className={`card h-full flex flex-col gap-4 transition-transform duration-300 ${idx % 2 === 0 ? 'hover:rotate-1 hover:-translate-y-1' : 'hover:-rotate-1 hover:-translate-y-1'}`}>
                    
                    {/* Character Visual */}
                    <div className="h-[140px] flex items-center justify-center border-b-[3px] border-dashed border-ink/15 pb-4 mb-2">
                      <div className="group-hover:animate-bob">
                        <Sv id={s} w={s === "croc" ? 170 : 100} />
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-2xl m-0 leading-tight">{l.name}</h3>
                        <span className="chip shrink-0 mt-1">{l.category}</span>
                      </div>
                      <p className="text-mut text-lg m-0 flex-1">{l.description}</p>
                    </div>

                    {/* Pricing & Stats */}
                    <div className="border-t-[3px] border-dashed border-ink/15 pt-4 mt-auto">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="font-gochi text-2xl font-bold text-[#1a8537]">{fmtMon(l.priceWei)} tMON</span>
                          <span className="text-mut text-sm font-sans font-medium">{fmtIdr(l.priceWei)} (demo)</span>
                        </div>
                        <div className="text-right flex flex-col text-sm font-sans font-bold opacity-60">
                          <span>{Math.round(l.successRate || 0)}% {t("success", "sukses")}</span>
                          <span>{l.avgLatencyMs || 0}ms {t("avg", "rata-rata")}</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

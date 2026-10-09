import type { CSSProperties } from "react";

/** Render sekali di layout. Berisi filter "w" (efek krayon), pola arsir, dan semua karakter. */
export function CrayonDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="w">
          <feTurbulence baseFrequency=".035" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="4" />
        </filter>
        <pattern id="hy" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="#fff8d6" /><line y2="6" stroke="#f6c21c" strokeWidth="4" /></pattern>
        <pattern id="hg" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="6" height="6" fill="#e6f7ea" /><line y2="6" stroke="#23a84a" strokeWidth="3" /></pattern>
        <pattern id="hb" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(50)"><rect width="6" height="6" fill="#e9ebff" /><line y2="6" stroke="#3a46c8" strokeWidth="3" /></pattern>
        <pattern id="hr" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><rect width="6" height="6" fill="#ffe8e6" /><line y2="6" stroke="#e8322b" strokeWidth="3" /></pattern>
      </defs>

      <symbol id="cat" viewBox="0 0 100 100">
        <path d="M16 42 20 10 40 28Q50 25 60 28L80 10 84 42Q94 66 50 88 6 66 16 42Z" fill="url(#hy)" stroke="#d99a00" strokeWidth="3" />
        <circle cx="36" cy="48" r="5" fill="#3a46c8" /><circle cx="64" cy="48" r="5" fill="#3a46c8" />
        <path d="M45 58h10l-5 6zM30 62 6 58M30 68 8 76M70 62 94 58M70 68 92 76M38 72Q50 82 62 72" fill="none" stroke="#e8322b" strokeWidth="3" />
      </symbol>
      <symbol id="frog" viewBox="0 0 100 100">
        <ellipse cx="50" cy="64" rx="36" ry="28" fill="url(#hg)" stroke="#23a84a" strokeWidth="3" />
        <circle cx="30" cy="30" r="13" fill="#fff" stroke="#23a84a" strokeWidth="3" /><circle cx="70" cy="30" r="13" fill="#fff" stroke="#23a84a" strokeWidth="3" />
        <circle cx="32" cy="32" r="4" fill="#2a2a4a" /><circle cx="68" cy="32" r="4" fill="#2a2a4a" />
        <path d="M28 62Q50 82 72 62M50 74q4 12 10 6" fill="none" stroke="#2a2a4a" strokeWidth="3" />
      </symbol>
      <symbol id="croc" viewBox="0 0 200 80">
        <path d="M4 46Q30 14 100 26L196 36 190 52 160 50 154 60 146 50 136 60 128 50 118 58 108 50Q50 74 4 46Z" fill="url(#hg)" stroke="#23a84a" strokeWidth="3" />
        <path d="M30 28l6-10 8 8 8-10 8 10 8-8 8 10" fill="none" stroke="#23a84a" strokeWidth="3" />
        <circle cx="150" cy="37" r="4" fill="#2a2a4a" />
      </symbol>
      <symbol id="bird" viewBox="0 0 100 100">
        <ellipse cx="50" cy="52" rx="30" ry="28" fill="url(#hy)" stroke="#d99a00" strokeWidth="3" />
        <path d="M44 26 50 8 58 26M78 46 96 52 78 58M42 80 38 96M58 80 62 96M22 52Q10 40 24 36" fill="none" stroke="#d99a00" strokeWidth="3" />
        <circle cx="62" cy="44" r="3.5" fill="#2a2a4a" />
      </symbol>
      <symbol id="monkey" viewBox="0 0 100 100">
        <circle cx="16" cy="44" r="12" fill="url(#hr)" stroke="#e8322b" strokeWidth="3" /><circle cx="84" cy="44" r="12" fill="url(#hr)" stroke="#e8322b" strokeWidth="3" />
        <circle cx="50" cy="50" r="30" fill="#fff" stroke="#e8322b" strokeWidth="3" /><ellipse cx="50" cy="60" rx="20" ry="15" fill="url(#hr)" />
        <circle cx="40" cy="42" r="4" fill="#2a2a4a" /><circle cx="60" cy="42" r="4" fill="#2a2a4a" />
        <path d="M40 64Q50 72 60 64" fill="none" stroke="#2a2a4a" strokeWidth="3" />
      </symbol>
      <symbol id="bug" viewBox="0 0 100 60">
        <ellipse cx="50" cy="32" rx="26" ry="16" fill="url(#hr)" stroke="#e8322b" strokeWidth="3" />
        <path d="M24 24 8 12M24 40 8 52M76 24 92 12M76 40 92 52M50 16V8M44 8h12" fill="none" stroke="#3a46c8" strokeWidth="3" />
      </symbol>
      <symbol id="sun" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="26" fill="url(#hy)" stroke="#d99a00" strokeWidth="3" />
        <path d="M50 4v14M50 82v14M4 50h14M82 50h14M18 18l10 10M72 72l10 10M82 18 72 28M28 72 18 82" stroke="#f6c21c" strokeWidth="5" fill="none" />
      </symbol>
      <symbol id="cloud" viewBox="0 0 100 50">
        <path d="M5 44Q0 22 25 24Q30 6 55 14Q76 2 86 24Q106 26 96 44Z" fill="url(#hb)" stroke="#3a46c8" strokeWidth="3" />
      </symbol>
    </svg>
  );
}

export type CritterId = "cat" | "frog" | "croc" | "bird" | "monkey" | "bug" | "sun" | "cloud";
const SZ: Partial<Record<CritterId, [number, number]>> = { croc: [200, 80], bug: [100, 60], cloud: [100, 50] };

/** <Sv id="cat" w={100} /> */
export function Sv({ id, w, className = "" }: { id: CritterId; w: number; className?: string }) {
  const [a, b] = SZ[id] ?? [100, 100];
  return (
    <svg className={`cr ${className}`} width={w} viewBox={`0 0 ${a} ${b}`} role="img" aria-label={id}>
      <use href={`#${id}`} width={a} height={b} />
    </svg>
  );
}

/** Kota krayon di atas footer. Deterministik, jadi aman untuk SSR. */
export function Sky() {
  const f = ["hy", "hg", "hb", "hr"], s = ["#d99a00", "#23a84a", "#3a46c8", "#e8322b"];
  const els: React.ReactNode[] = [];
  let p = -4, i = 0;
  while (p < 600) {
    const w = 34 + ((i * 37) % 26), h = 44 + ((i * 53) % 90);
    els.push(<rect key={`b${i}`} x={p} y={150 - h} width={w} height={h} fill={`url(#${f[i % 4]})`} stroke={s[i % 4]} strokeWidth="3" />);
    for (let r = 0; r < h / 24 - 1; r++)
      els.push(<rect key={`w${i}-${r}`} x={p + 8} y={150 - h + 10 + r * 22} width="8" height="11" fill="#fff" stroke={s[i % 4]} />);
    if (i === 6) els.push(<use key="cat" href="#cat" x={p - 6} y={150 - h - 34} width="46" height="46" />);
    p += w + 3; i++;
  }
  return (
    <svg className="sky cr" viewBox="0 0 600 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">{els}</svg>
  );
}

export const st = (o: Record<string, string | number>) => o as CSSProperties;

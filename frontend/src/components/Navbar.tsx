"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";
import BalanceChip from "./BalanceChip";

const links = [["/explore", "Explore"], ["/dashboard", "Dashboard"], ["/docs", "Docs"]] as const;

export default function Navbar() {
  const { ready, authenticated, address, login, logout } = useSession();
  const path = usePathname();
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
        <button className="btn b-b" disabled={!ready} onClick={authenticated ? logout : login}>
          {!ready ? "…" : authenticated ? `${address?.slice(0, 6)}… · Log out` : "Log in"}
        </button>
      </div>
    </nav>
  );
}
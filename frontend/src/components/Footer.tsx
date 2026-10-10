"use client";
import { Sky } from "./Crayon";
import { MOCK } from "@/lib/config";
import { useLang } from "@/components/LangProvider";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <Sky />
      <div className="foot">
        <p>
          {t(
            "Powered by Alchemy RPC Infrastructure · Real-time Escrow indexing by Envio · Login and embedded wallets by Privy · Built on Monad Testnet",
            "Ditenagai oleh Alchemy RPC Infrastructure · Indeksasi Escrow Real-time oleh Envio · Login dan embedded wallets oleh Privy · Dibangun di Monad Testnet"
          )}
        </p>
        {MOCK && <p>{t("Demo mode: chain, gateway, and login are simulated. Fee 0% on testnet.", "Mode Demo: chain, gateway, dan login disimulasikan. Biaya 0% di testnet.")}</p>}
      </div>
    </footer>
  );
}

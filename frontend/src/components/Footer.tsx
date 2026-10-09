import { Sky } from "./Crayon";
import { MOCK } from "@/lib/config";

export default function Footer() {
  return (
    <footer>
      <Sky />
      <div className="foot">
        <p>
          Powered by Alchemy RPC Infrastructure · Real-time Escrow indexing by Envio · Login and
          embedded wallets by Privy · Built on Monad Testnet
        </p>
        {MOCK && <p>Demo mode: chain, gateway, and login are simulated. Fee 0% on testnet.</p>}
      </div>
    </footer>
  );
}

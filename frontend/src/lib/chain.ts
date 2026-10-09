import { defineChain } from "viem";
import { CFG } from "./config";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Testnet MON", symbol: "tMON", decimals: 18 },
  rpcUrls: {
    default: { http: [CFG.rpc || "https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadExplorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
});
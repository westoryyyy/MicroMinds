export const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

export const CFG = {
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "",
  rpc: process.env.NEXT_PUBLIC_ALCHEMY_RPC ?? "",
  escrow: (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "") as `0x${string}`,
  apiBase: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
  envioUrl: process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL ?? "",
  explorerTx: "https://testnet.monadexplorer.com/tx/",
  idrRate: 16000, // estimasi demo untuk badge Rupiah
};
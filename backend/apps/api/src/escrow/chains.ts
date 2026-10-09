import { defineChain } from 'viem';

/**
 * Monad Testnet chain definition.
 * RPC is configured via ALCHEMY_RPC_URL env var (Alchemy only).
 * Do NOT hardcode RPC URLs here.
 */
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Testnet MON',
    symbol: 'tMON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'], // fallback only
    },
    alchemy: {
      http: ['https://monad-testnet.g.alchemy.com/v2'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
});

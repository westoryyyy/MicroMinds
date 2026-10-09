import {
  BaseError, ContractFunctionRevertedError, createPublicClient, createWalletClient,
  custom, http, parseAbi,
} from "viem";
import { CFG, MOCK } from "./config";
import { monadTestnet } from "./chain";
import { hx, mockDb, sleep } from "./mock";
import type { Hex } from "./types";

/** Dari Escrow.sol / abi-skeleton. Ganti ke deployments/abi.json jika SC engineer sudah mengekspor. */
import type { Abi } from "viem";
import abiJson from "./abi/escrow.json";
export const escrowAbi = abiJson as Abi;


const ERR_MSG: Record<string, string> = {
  InsufficientBalance: "Saldo escrow tidak cukup.",
  ZeroAmount: "Jumlah harus lebih dari 0.",
  CallNotExpired: "Belum 24 jam sejak dana ditahan. Refund paksa belum bisa.",
  CallNotReserved: "Panggilan ini sudah selesai (released/refunded).",
  NotConsumer: "Hanya pemilik panggilan yang bisa refund paksa.",
  TransferFailed: "Transfer gagal. Coba lagi.",
};

export class EscrowError extends Error {}

function friendly(e: unknown): string {
  if (e instanceof BaseError) {
    const r = e.walk((x) => x instanceof ContractFunctionRevertedError);
    if (r instanceof ContractFunctionRevertedError && r.data?.errorName && ERR_MSG[r.data.errorName])
      return ERR_MSG[r.data.errorName];
    if (/rejected|denied/i.test(e.shortMessage)) return "Transaksi dibatalkan.";
    if (/insufficient funds/i.test(e.shortMessage))
      return "tMON di wallet tidak cukup untuk jumlah + gas. Minta dari faucet Monad testnet.";
    return e.shortMessage;
  }
  return e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.";
}

export const publicClient = createPublicClient({ chain: monadTestnet, transport: http(CFG.rpc || undefined) });

export type Signer = { address?: Hex; getProvider: () => Promise<any | null> };

async function send(s: Signer, functionName: "deposit" | "withdraw" | "forceRefund", args: any[], value?: bigint) {
  if (!s.address) throw new EscrowError("Login dulu.");
  if (!CFG.escrow) throw new EscrowError("NEXT_PUBLIC_ESCROW_ADDRESS belum diisi.");
  const provider = await s.getProvider();
  if (!provider) throw new EscrowError("Wallet belum siap. Coba lagi sebentar.");
  try {
    const wallet = createWalletClient({ account: s.address, chain: monadTestnet, transport: custom(provider) });
    const { request } = await publicClient.simulateContract({
      account: s.address, address: CFG.escrow, abi: escrowAbi, functionName, args, value,
    } as any); // simulasi dulu: error kontrak terbaca jelas sebelum wallet menandatangani
    const hash = await wallet.writeContract(request as any);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new EscrowError("Transaksi gagal di chain.");
    return hash;
  } catch (e) {
    throw e instanceof EscrowError ? e : new EscrowError(friendly(e));
  }
}

export async function readBalance(address: Hex): Promise<bigint> {
  if (MOCK) { await sleep(150); return mockDb.balance; }
  return (await publicClient.readContract({
    address: CFG.escrow, abi: escrowAbi, functionName: "balances", args: [address],
  })) as bigint;
}

export async function deposit(s: Signer, wei: bigint): Promise<Hex> {
  if (wei <= 0n) throw new EscrowError("Jumlah harus lebih dari 0.");
  if (MOCK) { await sleep(900); mockDb.balance += wei; return hx(64); }
  return send(s, "deposit", [], wei);
}

export async function withdraw(s: Signer, wei: bigint): Promise<Hex> {
  if (wei <= 0n) throw new EscrowError("Jumlah harus lebih dari 0.");
  if (MOCK) {
    await sleep(900);
    if (wei > mockDb.balance) throw new EscrowError(ERR_MSG.InsufficientBalance);
    mockDb.balance -= wei; return hx(64);
  }
  return send(s, "withdraw", [wei]);
}

export async function forceRefund(s: Signer, callId: Hex): Promise<Hex> {
  if (MOCK) {
    await sleep(900);
    const c = mockDb.calls.find((x) => x.callId === callId);
    if (!c || c.status !== "reserved") throw new EscrowError(ERR_MSG.CallNotReserved);
    c.status = "force_refunded"; c.finalizedAt = Math.floor(Date.now() / 1000);
    mockDb.balance += c.amount; return (c.finalTx = hx(64));
  }
  return send(s, "forceRefund", [callId]);
}
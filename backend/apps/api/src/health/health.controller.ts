import { Controller, Get } from '@nestjs/common';
import { EscrowService } from '../escrow/escrow.service';
import { RealEscrowService } from '../escrow/real-escrow.service';
import { ConfigService } from '@nestjs/config';
import { formatEther } from 'viem';

@Controller('health')
export class HealthController {
  constructor(
    private readonly escrow: EscrowService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * GET /health/operator
   * Returns operator wallet status for monitoring / juri demo.
   */
  @Get('operator')
  async operatorHealth() {
    const minBalStr =
      this.config.get<string>('OPERATOR_MIN_BALANCE') ?? '0.05';
    const minBalWei = BigInt(Math.floor(parseFloat(minBalStr) * 1e18));

    // Only RealEscrowService has operator introspection
    const backend = (this.escrow as any).backend;
    if (!(backend instanceof RealEscrowService)) {
      return {
        address: 'mock',
        balance: '∞',
        minBalance: minBalStr,
        isOnChainOperator: true,
        status: 'ok',
        note: 'ESCROW_MOCK=true — no real operator wallet',
      };
    }

    const address = backend.getOperatorAddress();
    const balanceWei = await backend.getOperatorBalance();
    const balanceEth = parseFloat(formatEther(balanceWei)).toFixed(4);

    // Check on-chain operator matches backend key
    let isOnChainOperator = false;
    try {
      const { createPublicClient, http } = await import('viem');
      const { monadTestnet } = await import('../escrow/chains');
      const { ESCROW_ABI } = await import('../escrow/escrow.abi');
      const escrowAddress =
        this.config.get<string>('ESCROW_ADDRESS') ??
        '0x0000000000000000000000000000000000000000';
      const pc = createPublicClient({
        chain: monadTestnet,
        transport: http(this.config.getOrThrow<string>('ALCHEMY_RPC_URL')),
      });
      const onChainOperator = (await pc.readContract({
        address: escrowAddress as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'operator',
      })) as string;
      isOnChainOperator =
        onChainOperator.toLowerCase() === address.toLowerCase();
    } catch {
      // Non-fatal: can't reach chain
      isOnChainOperator = false;
    }

    const status =
      !isOnChainOperator
        ? 'misconfigured'
        : balanceWei < minBalWei
          ? 'low'
          : 'ok';

    if (!isOnChainOperator) {
      // Log loudly at startup — also logged from onModuleInit
      console.warn(
        `[HealthController] WARNING: backend operator ${address} does NOT match on-chain operator!`,
      );
    }

    return {
      address,
      balance: `${balanceEth} MON`,
      minBalance: `${minBalStr} MON`,
      isOnChainOperator,
      status,
    };
  }
}

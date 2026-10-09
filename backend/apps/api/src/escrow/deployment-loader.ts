import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('DeploymentLoader');

interface DeploymentFile {
  escrow?: string;
  Escrow?: string;
  contracts?: {
    Escrow?: { address: string };
    escrow?: { address: string };
  };
  [key: string]: unknown;
}

/**
 * Attempts to read the Escrow contract address from the Foundry deployment file:
 *   packages/contracts/deployments/monad-testnet.json
 *
 * Returns null if the file does not exist yet (contract not deployed).
 * The caller MUST fall back to ESCROW_ADDRESS env var in that case.
 *
 * We intentionally do NOT throw if the file is missing — the file is
 * managed by the contracts team and may not exist in all environments.
 */
export function loadDeployedEscrowAddress(): string | null {
  // Walk up from apps/api to the repo root to find packages/contracts
  const possiblePaths = [
    // Running from apps/api/
    path.resolve(__dirname, '../../../../smart-contract/deployments/monad-testnet.json'),
    path.resolve(__dirname, '../../../../packages/contracts/deployments/monad-testnet.json'),
    // Running from repo root
    path.resolve(process.cwd(), 'packages/contracts/deployments/monad-testnet.json'),
    path.resolve(process.cwd(), 'smart-contract/deployments/monad-testnet.json'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data: DeploymentFile = JSON.parse(raw) as DeploymentFile;

        // Try multiple possible shapes of the deployment JSON
        const address =
          (data.escrow as string | undefined) ??
          (data.Escrow as string | undefined) ??
          data.contracts?.Escrow?.address ??
          data.contracts?.escrow?.address;

        if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) {
          logger.log(`Loaded Escrow address from ${filePath}: ${address}`);
          return address;
        }

        logger.warn(
          `Deployment file found at ${filePath} but Escrow address not found or invalid. ` +
            `Keys available: ${Object.keys(data).join(', ')}`,
        );
      } catch (err) {
        logger.warn(`Failed to parse deployment file at ${filePath}: ${String(err)}`);
      }
    }
  }

  return null;
}

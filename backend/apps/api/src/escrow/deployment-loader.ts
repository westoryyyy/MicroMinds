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
export interface DeploymentData {
  address: string;
  abi?: unknown[];
}

export function loadDeployedEscrow(): DeploymentData | null {
  const possiblePaths = [
    path.resolve(__dirname, '../../../../smart-contract/deployments/monad-testnet.json'),
    path.resolve(__dirname, '../../../../packages/contracts/deployments/monad-testnet.json'),
    path.resolve(process.cwd(), 'packages/contracts/deployments/monad-testnet.json'),
    path.resolve(process.cwd(), 'smart-contract/deployments/monad-testnet.json'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        const address =
          data.address ??
          data.escrow ??
          data.Escrow ??
          data.contracts?.Escrow?.address ??
          data.contracts?.escrow?.address;

        if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) {
          logger.log(`Loaded Escrow deployment from ${filePath}: ${address}`);
          return {
            address,
            abi: data.abi,
          };
        }

        logger.warn(
          `Deployment file found at ${filePath} but Escrow address not found or invalid.`
        );
      } catch (err) {
        logger.warn(`Failed to parse deployment file at ${filePath}: ${String(err)}`);
      }
    }
  }

  return null;
}

import { createHash, randomBytes } from 'crypto';

/**
 * Generates a secure random API key (hex, 32 bytes = 64 chars).
 * Never stored in DB — only the SHA-256 hash is stored.
 */
export function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * SHA-256 hash of the plaintext key. This is what gets stored in DB.
 */
export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex');
}

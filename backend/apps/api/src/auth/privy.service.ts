import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/node';
import { ApiException } from '../common/exceptions/api.exception';

/**
 * PrivyService — wraps @privy-io/node PrivyClient.
 *
 * Exposes verifyAccessToken(bearerToken) which:
 *   - Strips the "Bearer " prefix if present
 *   - Calls privy.utils().auth().verifyAccessToken()
 *   - Returns { userId, walletAddress? } or throws INVALID_TOKEN
 *
 * PRIVY_MOCK=true short-circuits verification for local dev when no
 * Privy app exists yet — it trusts the sub claim from the JWT without
 * signature validation.
 */
@Injectable()
export class PrivyService implements OnModuleInit {
  private readonly logger = new Logger(PrivyService.name);
  private privy!: PrivyClient;
  private readonly mock: boolean;

  constructor(private readonly config: ConfigService) {
    this.mock = config.get<string>('PRIVY_MOCK') === 'true';
  }

  onModuleInit(): void {
    if (this.mock) {
      this.logger.warn('PrivyService running in MOCK mode — tokens are NOT verified');
      return;
    }

    const appId = this.config.getOrThrow<string>('PRIVY_APP_ID');
    const appSecret = this.config.getOrThrow<string>('PRIVY_APP_SECRET');

    this.privy = new PrivyClient({ appId, appSecret });
    this.logger.log(`PrivyService initialized for appId=${appId}`);
  }

  /**
   * Verify a Privy access token and extract claims.
   * @param bearerToken - raw Authorization header value or bare JWT
   * @returns { userId: string (Privy DID) }
   * @throws ApiException INVALID_TOKEN if verification fails
   */
  async verifyAccessToken(bearerToken: string): Promise<{ userId: string }> {
    const token = bearerToken.startsWith('Bearer ')
      ? bearerToken.slice(7)
      : bearerToken;

    // ── Mock mode: decode without verifying signature ─────────────────────────
    if (this.mock) {
      try {
        const [, payloadB64] = token.split('.');
        const payload = JSON.parse(
          Buffer.from(payloadB64, 'base64url').toString('utf8'),
        ) as { sub?: string };
        const userId = payload.sub ?? 'mock-user';
        this.logger.debug(`[MOCK] Privy token userId=${userId}`);
        return { userId };
      } catch {
        // If it's not a JWT, return a synthetic userId for testing
        return { userId: `mock-${token.slice(0, 8)}` };
      }
    }

    // ── Real mode: full signature + expiry verification ───────────────────────
    try {
      const claims = await this.privy.utils().auth().verifyAccessToken(token);
      this.logger.debug(`Privy token valid: userId=${claims.user_id}`);
      return { userId: claims.user_id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Privy token verification failed: ${msg}`);
      throw new ApiException(
        'INVALID_TOKEN',
        'Privy access token is invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrivyService } from './privy.service';
import { z } from 'zod';

const CreateApiKeyDto = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum address'),
  label: z.string().max(100).optional(),
});

@Controller('api-keys')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly privyService: PrivyService,
  ) {}

  /**
   * POST /api-keys
   * Headers: Authorization: Bearer <privy-access-token>
   * Body: { walletAddress, label? }
   *
   * Flow:
   *   1. Verify Privy token from Authorization header
   *   2. Extract userId (Privy DID)
   *   3. Generate API key, store SHA-256 hash
   *   4. Return plaintext key — shown ONCE, never stored
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('authorization') authorization: string,
    @Body() body: unknown,
  ) {
    // Step 1: Verify Privy access token
    await this.privyService.verifyAccessToken(authorization ?? '');

    // Step 2: Validate body
    const dto = CreateApiKeyDto.parse(body);

    // Step 3: Create API key (SHA-256 hash stored, plaintext returned once)
    const result = await this.authService.createApiKey(
      dto.walletAddress,
      dto.label,
    );

    // Step 4: Return plaintext key — caller must store this immediately
    return {
      id: result.id,
      apiKey: result.key,
      walletAddress: dto.walletAddress,
      label: dto.label ?? null,
      message: 'Store this key securely — it will not be shown again.',
    };
  }
}

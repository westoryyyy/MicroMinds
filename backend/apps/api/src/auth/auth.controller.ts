import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { z } from 'zod';

const CreateApiKeyDto = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum address'),
  label: z.string().max(100).optional(),
  // Privy access token — verified server-side in Phase 3
  // For Phase 1 scaffold: accepted but not yet validated against Privy
  privyToken: z.string().optional(),
});

@Controller('api-keys')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api-keys
   * Body: { walletAddress, label?, privyToken? }
   * Returns: { id, key } — key is shown ONCE, never again.
   *
   * NOTE: Privy token verification is wired in Phase 3.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const dto = CreateApiKeyDto.parse(body);
    const result = await this.authService.createApiKey(
      dto.walletAddress,
      dto.label,
    );
    return {
      id: result.id,
      key: result.key,
      walletAddress: dto.walletAddress,
      message: 'Store this key securely — it will not be shown again.',
    };
  }
}

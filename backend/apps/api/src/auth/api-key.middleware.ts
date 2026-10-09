import {
  Injectable,
  NestMiddleware,
  Inject,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '../common/exceptions/api.exception';

/** Attaches req.walletAddress after validating the x-api-key header */
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const apiKey =
      (req.headers['x-api-key'] as string | undefined) ??
      (req.headers['authorization'] as string | undefined)?.replace(
        /^Bearer\s+/i,
        '',
      );

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key');
    }

    const walletAddress = await this.authService.validateApiKey(apiKey);
    (req as Request & { walletAddress: string }).walletAddress = walletAddress;
    next();
  }
}

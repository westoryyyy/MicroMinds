import { CanActivate, ExecutionContext, Injectable, HttpStatus } from '@nestjs/common';
import { PrivyService } from './privy.service';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/node';
import { ApiException } from '../common/exceptions/api.exception';

@Injectable()
export class PrivyAuthGuard implements CanActivate {
  private privy: PrivyClient | undefined;
  private readonly mock: boolean;

  constructor(
    private readonly privyService: PrivyService,
    private readonly config: ConfigService,
  ) {
    this.mock = this.config.get<string>('PRIVY_MOCK') === 'true';
    if (!this.mock) {
      this.privy = new PrivyClient({
        appId: this.config.getOrThrow<string>('PRIVY_APP_ID'),
        appSecret: this.config.getOrThrow<string>('PRIVY_APP_SECRET'),
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      throw new ApiException('UNAUTHORIZED', 'Missing Authorization header', HttpStatus.UNAUTHORIZED);
    }

    const { userId } = await this.privyService.verifyAccessToken(authHeader);
    
    let address = '0x0000000000000000000000000000000000000000'; // fallback
    
    if (this.mock) {
      address = '0x1234567890123456789012345678901234567890';
    } else if (this.privy) {
      try {
        const user = await this.privy.getUser(userId);
        const wallet = user.linkedAccounts?.find((a: any) => a.type === 'wallet');
        if (wallet && 'address' in wallet) {
          address = wallet.address;
        }
      } catch (err) {
        // ignore
      }
    }

    request.user = { id: userId, address };
    return true;
  }
}

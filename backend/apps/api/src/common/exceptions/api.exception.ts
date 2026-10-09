import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}

export class NotFoundException extends ApiException {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} '${id}' not found` : `${resource} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message = 'Invalid or missing API key') {
    super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }
}

export class InsufficientBalanceException extends ApiException {
  constructor() {
    super(
      'INSUFFICIENT_BALANCE',
      'Consumer balance is insufficient for this call',
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  HttpRequestError,
  RpcRequestError,
} from 'viem';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Maps Viem/Alchemy errors to structured NestJS HttpExceptions.
 *
 * Key insight: Alchemy wraps "Signer had insufficient balance" inside RPC
 * error -32602 ("Missing or invalid parameters"), so we must string-match
 * in addition to class-checking.
 */
export function toHttpException(err: unknown): HttpException {
  if (!(err instanceof BaseError)) {
    return new HttpException({ code: 'UNKNOWN', message: String(err) }, 500);
  }

  // 1. Smart-contract revert (custom error or revert reason)
  const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (revert instanceof ContractFunctionRevertedError) {
    const name =
      revert.data?.errorName ?? revert.reason ?? revert.shortMessage;

    if (name === 'NotOperator') {
      return new HttpException(
        {
          code: 'OPERATOR_MISMATCH',
          message: 'Layanan sedang maintenance, coba lagi sebentar.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (name === 'InsufficientBalance') {
      return new HttpException(
        {
          code: 'ESCROW_INSUFFICIENT_BALANCE',
          message: 'Saldo escrow tidak cukup untuk memanggil layanan ini.',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    return new HttpException(
      { code: 'CONTRACT_REVERT', message: name },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  // 2. Operator gas exhausted (check both class AND string — Alchemy masks this)
  const raw =
    `${err.shortMessage} ${err.details ?? ''} ${err.message}`.toLowerCase();
  if (
    err.walk((e) => e instanceof InsufficientFundsError) ||
    raw.includes('insufficient balance') ||
    raw.includes('insufficient funds')
  ) {
    return new HttpException(
      {
        code: 'OPERATOR_OUT_OF_GAS',
        message: 'Layanan sedang maintenance, coba lagi sebentar.',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  // 3. RPC / network problems
  if (
    err.walk(
      (e) => e instanceof HttpRequestError || e instanceof RpcRequestError,
    )
  ) {
    return new HttpException(
      { code: 'RPC_ERROR', message: err.shortMessage },
      HttpStatus.BAD_GATEWAY,
    );
  }

  return new HttpException(
    { code: 'TX_FAILED', message: err.shortMessage },
    500,
  );
}

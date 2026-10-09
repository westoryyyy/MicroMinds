import { Injectable, Logger } from '@nestjs/common';
import Ajv, { AnySchemaObject } from 'ajv';
import addFormats from 'ajv-formats';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * ValidationService — validates provider response body against
 * the listing's schema_output (JSON Schema via Ajv).
 */
@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ strict: false, allErrors: true });
    addFormats(this.ajv);
  }

  /**
   * Validate data against a JSON Schema.
   * @returns { valid, errors: human-readable strings }
   */
  validate(schema: AnySchemaObject, data: unknown): ValidationResult {
    const valid = this.ajv.validate(schema, data) as boolean;

    if (!valid) {
      const errors = (this.ajv.errors ?? []).map(
        (e) => `${e.instancePath || '(root)'} ${e.message ?? 'invalid'}`,
      );
      this.logger.debug(`Schema validation failed: ${errors.join('; ')}`);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }
}

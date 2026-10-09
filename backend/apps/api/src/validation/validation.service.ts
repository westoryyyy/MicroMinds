import { Injectable, Logger } from '@nestjs/common';
import Ajv, { AnySchemaObject } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * ValidationService — validates provider response body against
 * the listing's schema_output (JSON Schema).
 * Phase 1: scaffold. Phase 3: wired into POST /call.
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
   * Returns true if data matches schema, false otherwise.
   */
  validate(schema: AnySchemaObject, data: unknown): boolean {
    const valid = this.ajv.validate(schema, data);
    if (!valid) {
      this.logger.debug(
        `Schema validation failed: ${this.ajv.errorsText()}`,
      );
    }
    return valid as boolean;
  }
}

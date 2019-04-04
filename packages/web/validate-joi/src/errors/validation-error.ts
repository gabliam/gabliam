import { Joi } from '@gabliam/core';
import { ValidationOptions } from '../metadatas';
import * as EscapeHtml from 'escape-html';

/**
 * Exception when validation error
 */
export class ValidationError extends Error {
  name = 'ValidationError';

  constructor(
    public error: Joi.ValidationError,
    public source: string,
    public options: ValidationOptions
  ) {
    super();
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toJSON() {
    const error: any = {
      statusCode: 400,
      error: 'Bad Request',
      message: this.error.message,
      validation: {
        source: this.source,
        keys: [],
      },
    };

    if (this.error.details) {
      for (let i = 0; i < this.error.details.length; i += 1) {
        /* istanbul ignore next */
        const path: string = Array.isArray(this.error.details[i].path)
          ? this.error.details[i].path.join('.')
          : (this.error.details[i].path as any);

        let keys: string;
        if (this.options.escapeHtml) {
          keys = EscapeHtml(path);
        } else {
          keys = path;
        }
        error.validation.keys.push(keys);
      }
    }

    return error;
  }
}

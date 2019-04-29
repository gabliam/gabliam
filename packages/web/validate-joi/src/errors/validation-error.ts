import { Joi } from '@gabliam/core';
import { BadRequestException } from '@gabliam/web-core';
import * as EscapeHtml from 'escape-html';
import { ValidationOptions } from '../metadatas';

const getKeys = (error: Joi.ValidationError, options: ValidationOptions) => {
  const keys: string[] = [];
  if (error.details) {
    for (let i = 0; i < error.details.length; i += 1) {
      /* istanbul ignore next */
      const path: string = Array.isArray(error.details[i].path)
        ? error.details[i].path.join('.')
        : (error.details[i].path as any);

      let k: string;
      if (options.escapeHtml) {
        k = EscapeHtml(path);
      } else {
        k = path;
      }
      keys.push(k);
    }
  }

  return keys;
};

export const createValidationException = (
  error: Joi.ValidationError,
  source: string,
  options: ValidationOptions
) =>
  new BadRequestException(error.message, undefined, {
    validation: {
      source: source,
      keys: getKeys(error, options),
    },
  });

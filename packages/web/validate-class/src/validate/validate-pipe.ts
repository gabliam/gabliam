import { isNil, Service, Type } from '@gabliam/core';
import { Pipe } from '@gabliam/web-core';
import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';
import { Validate } from '../metadatas';

@Service()
export class ValidatePipe implements Pipe {
  constructor(private options: Validate) {}

  async transform(value: any, type?: any) {
    if (!type || !this.toValidate(type)) {
      return value;
    }
    const entity = classTransformer.plainToClass<any, any>(
      type,
      this.toEmptyIfNil(value),
      this.options.transformOptions,
    );
    const errors = await classValidator.validate(
      entity,
      this.options.validatorOptions,
    );
    if (errors.length > 0) {
      throw this.options.exceptionFactory(
        errors,
        this.options.disableErrorMessages,
      );
    }

    if (this.options.transform) {
      return entity;
    }

    if (Object.keys(this.options.validatorOptions).length > 0) {
      return classTransformer.classToPlain(
        entity,
        this.options.transformOptions,
      );
    }

    return value;
  }

  toEmptyIfNil<T = any>(value: T): T | {} {
    return isNil(value) ? {} : value;
  }

  private toValidate(type: Type<any>) {
    const types = [String, Boolean, Number, Array, Object];
    return !types.some((t) => type === t) && !isNil(type);
  }
}

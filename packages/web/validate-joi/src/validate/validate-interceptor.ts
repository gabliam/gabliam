import {
  inject,
  Joi,
  reflection,
  Service,
  ValueExtractor,
  VALUE_EXTRACTOR,
} from '@gabliam/core';
import {
  ExecContext,
  ExecutionContext,
  GabRequest,
  Interceptor,
  Request,
} from '@gabliam/web-core';
import {
  constructValidator,
  listParamToValidate,
  Validate,
  ValidatorType,
} from '../metadatas';
import { createValidateRequest, NO_VALIDATION } from './validate-request';

@Service()
export class ValidateInterceptor implements Interceptor {
  constructor(
    @inject(VALUE_EXTRACTOR) private valueExtractor: ValueExtractor,
  ) {}

  async intercept(
    @ExecContext() execCtx: ExecutionContext,
    @Request() req: GabRequest,
  ) {
    const target = execCtx.getConstructor();
    const key = execCtx.getHandlerName();

    const [metadata] = (
      reflection.propMetadataOfDecorator<Validate>(target, Validate)[
        <any>key
      ] || []
    ).slice(-1);

    if (!metadata) {
      return;
    }
    let rules: Map<ValidatorType, Joi.Schema>;
    let validationOptions = metadata.validationOptions;

    if (metadata.rules === undefined && metadata.validatorCreator) {
      const validator = constructValidator(
        metadata.validatorCreator(this.valueExtractor),
      );
      rules = validator.rules;
      validationOptions = {
        ...validationOptions,
        ...validator.validationOptions,
      };

      // save rules and validationOptions in metadata for prevent validator construct on each call
      metadata.rules = rules;
      metadata.validationOptions = validationOptions;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rules = metadata.rules!;
    }

    const validateRequest = createValidateRequest(rules, validationOptions);

    for (const paramToValidate of listParamToValidate) {
      const val = validateRequest(paramToValidate, req[paramToValidate]);
      if (val !== NO_VALIDATION) {
        req[paramToValidate] = val;
      }
    }
  }
}

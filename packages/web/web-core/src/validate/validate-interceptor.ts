import { reflection, Service } from '@gabliam/core';
import { ExecutionContext } from '../execution-context';
import { GabRequest } from '../gab-request';
import { Interceptor } from '../interceptor';
import {
  ExecContext,
  listParamToValidate,
  Request,
  Validate,
} from '../metadatas';
import { createValidateRequest, NO_VALIDATION } from './validate-request';

@Service()
export class ValidateInterceptor implements Interceptor {
  async intercept(
    @ExecContext() execCtx: ExecutionContext,
    @Request() req: GabRequest
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

    const validateRequest = createValidateRequest(
      metadata.rules,
      metadata.validationOptions
    );

    for (const paramToValidate of listParamToValidate) {
      const val = validateRequest(paramToValidate, req[paramToValidate]);
      if (val !== NO_VALIDATION) {
        req[paramToValidate] = val;
      }
    }
  }
}

import { Container, Service } from '@gabliam/core';
import { METADATA_KEY } from './constants';
import {
  ExecContext,
  getParameterMetadata,
  Interceptor,
  InterceptorInfo,
  listParamToValidate,
  Request,
  ValidateMetadata,
} from './decorators';
import { ExecutionContext } from './execution-context';
import { GabRequest } from './gab-request';
import { createValidateRequest, NO_VALIDATION } from './validate-request';

@Service()
export class ValidateInterceptor implements Interceptor {
  intercept(
    @ExecContext() execCtx: ExecutionContext,
    @Request() req: GabRequest
  ) {
    const target = execCtx.getConstructor();
    const key = execCtx.getHandlerName();
    if (target && !Reflect.hasOwnMetadata(METADATA_KEY.validate, target, key)) {
      return;
    }

    const metadata: ValidateMetadata = Reflect.getOwnMetadata(
      METADATA_KEY.validate,
      target,
      key
    );
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

export const getValidateInterceptor = (
  container: Container
): InterceptorInfo<Interceptor> => {
  const validateInterceptor = container.get(ValidateInterceptor);
  return {
    instance: validateInterceptor,
    paramList: getParameterMetadata(validateInterceptor, 'intercept'),
  };
};

import { Container } from '@gabliam/core';
import { InterceptorInfo } from '../interceptor';
import { getExtractArgs } from '../utils';
import { ValidateInterceptor } from './validate-interceptor';
import { ValidateSendErrorInterceptor } from './validate-senderror-interceptor';

export const getValidateInterceptor = (
  container: Container
): InterceptorInfo[] => {
  const validateInterceptor = container.get(ValidateInterceptor);
  const validateSendErrorInterceptor = container.get(
    ValidateSendErrorInterceptor
  );
  return [
    {
      instance: validateSendErrorInterceptor,
      extractArgs: getExtractArgs(validateSendErrorInterceptor, 'intercept'),
    },
    {
      instance: validateInterceptor,
      extractArgs: getExtractArgs(validateInterceptor, 'intercept'),
    },
  ];
};

import { Container } from '@gabliam/core';
import { getParameterMetadata, InterceptorInfo } from '../decorators';
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
      paramList: getParameterMetadata(
        validateSendErrorInterceptor,
        'intercept'
      ),
    },
    {
      instance: validateInterceptor,
      paramList: getParameterMetadata(validateInterceptor, 'intercept'),
    },
  ];
};

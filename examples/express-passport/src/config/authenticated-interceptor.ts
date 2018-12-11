import { Interceptor, Request, GabRequest } from '@gabliam/web-core';
import { express } from '@gabliam/express';
import * as Boom from 'boom';
import { Service } from '@gabliam/core';

@Service()
export class AuthInterceptor implements Interceptor {
  intercept(@Request() req: GabRequest<express.Request>) {
    if (
      !req.originalRequest.isAuthenticated ||
      !req.originalRequest.isAuthenticated()
    ) {
      throw Boom.forbidden();
    }
  }
}

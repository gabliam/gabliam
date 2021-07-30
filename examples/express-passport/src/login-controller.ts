import { Joi } from '@gabliam/core';
import { UseExpressInterceptors } from '@gabliam/express';
import { Validate } from '@gabliam/validate-joi';
import { Post, ResponseEntity, RestController } from '@gabliam/web-core';
import passport from 'passport';

@RestController('/')
export class LoginController {
  @Validate({
    validator: {
      body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
      }),
    },
    options: { abortEarly: false },
  })
  @UseExpressInterceptors(
    passport.authenticate('local', { failWithError: true })
  )
  @Post('/login')
  async login() {
    return ResponseEntity.noContent();
  }
}

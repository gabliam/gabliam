import {
  RestController,
  Post,
  Validate,
  ResponseEntity,
} from '@gabliam/web-core';
import { Joi } from '@gabliam/core';
import * as passport from 'passport';
import { UseExpressInterceptors } from '@gabliam/express';

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

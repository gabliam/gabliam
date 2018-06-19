import { RestController, Post, Validate } from '@gabliam/express';
import { Joi } from '@gabliam/core';
import * as passport from 'passport';

@RestController('/')
export class LoginController {
  @Validate({
    validator: {
      body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
      })
    },
    options: { abortEarly: false }
  })
  @Post('/login', passport.authenticate('local'))
  async login() {
    return 'success';
  }
}

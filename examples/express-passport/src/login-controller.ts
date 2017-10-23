import { RestController, Post, express as e } from '@gabliam/express';
import { Joi } from '@gabliam/core';
import * as passport from 'passport';
import * as Celebrate from 'celebrate';

/**
 * Middleware for validation of login
 */
const loginMiddleware = Celebrate(
  {
    body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required()
    })
  },
  { abortEarly: false }
);

@RestController('/')
export class LoginController {
  @Post('/login', loginMiddleware, passport.authenticate('local'))
  async login(req: e.Request, res: e.Response, next: e.NextFunction) {
    return 'success';
  }
}

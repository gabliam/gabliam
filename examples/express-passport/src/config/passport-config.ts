import { Config } from '@gabliam/core';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { LokiDatabase } from './loki-database';
/**
 * Why 151 ?
 * For load this configuration after LokiConfig
 */
@Config(151)
export class PassportConfig {
  constructor(lokiDatabase: LokiDatabase) {
    this.configurePassport(lokiDatabase);
  }

  configurePassport(lokiDatabase: LokiDatabase) {
    const userCollection = lokiDatabase.getUserCollection();
    passport.use(
      'local',
      new LocalStrategy((username, password, done) => {
        const user = userCollection.findOne({ username });
        if (!user) {
          return done(null, false);
        }
        if (password !== user.password) {
          return done(null, false);
        }
        return done(null, user);
      })
    );

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
  }
}

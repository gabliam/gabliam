import { RestController, Get, MiddlewareInject } from '@gabliam/express';
import { LokiDatabase } from './config/loki-database';
import { User, UserSerialize } from './entities/user';
import { Serialize } from 'cerialize';

@RestController('/test')
@MiddlewareInject('authenticated')
export class UserController {
  userCollection: Collection<User>;

  constructor(lokiDatabase: LokiDatabase) {
    this.userCollection = lokiDatabase.getUserCollection();
  }

  @Get('/')
  async getAll() {
    return Serialize(this.userCollection.find(), UserSerialize);
  }
}

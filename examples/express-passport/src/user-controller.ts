import { RestController, Get, UseInterceptors } from '@gabliam/web-core';
import { LokiDatabase } from './config/loki-database';
import { User, UserSerialize } from './entities/user';
import { Serialize } from 'cerialize';
import { AuthInterceptor } from './config/authenticated-interceptor';

@RestController('/test')
@UseInterceptors(AuthInterceptor)
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

import {
  RestController,
  Get,
  express,
  MiddlewareInject
} from '@gabliam/express';
import { LokiDatabase } from './config/loki-database';
import { User, UserSerialize } from './entities/user';
import { Serialize } from 'cerialize';

@RestController('/test')
@MiddlewareInject('authenticated')
export class UserController {
  userCollection: LokiCollection<User>;

  constructor(lokiDatabase: LokiDatabase) {
    this.userCollection = lokiDatabase.getUserCollection();
  }

  @Get('/')
  async getById(req: express.Request, res: express.Response) {
    return Serialize(this.userCollection.find(), UserSerialize);
  }
}

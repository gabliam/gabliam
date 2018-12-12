import {
  Controller,
  Get,
  ResponseBody,
  UseInterceptors,
} from '@gabliam/web-core';
import { Serialize } from 'cerialize';
import { AuthInterceptor } from './config/authenticated-interceptor';
import { LokiDatabase } from './config/loki-database';
import { User, UserSerialize } from './entities/user';

@Controller('/test')
@UseInterceptors(AuthInterceptor)
export class UserController {
  userCollection: Collection<User>;

  constructor(lokiDatabase: LokiDatabase) {
    this.userCollection = lokiDatabase.getUserCollection();
  }

  @ResponseBody()
  @Get('/hi')
  async hi() {
    return 'Hi';
  }

  @Get('/')
  async getAll() {
    return 'lol';
    return Serialize(this.userCollection.find(), UserSerialize);
  }
}

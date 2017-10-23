import * as lokijs from 'lokijs';
import { User } from '../entities/user';
import { Deferred } from '../defered';

export class LokiDatabase {
  private isInit: Deferred<any>;

  private db: Loki;

  constructor(dbPath: string) {
    this.isInit = new Deferred();
    this.db = new lokijs(dbPath, {
      autoload: true,
      autoloadCallback: () => this.initialize(),
      autosave: true,
      autosaveInterval: 4000
    });
  }

  waitLoad() {
    return this.isInit.promise;
  }

  getUserCollection() {
    return this.db.getCollection<User>('users');
  }

  private initialize() {
    let users = this.db.getCollection<User>('users');
    if (users === null) {
      users = this.db.addCollection<User>('users');
      users.insert([
        {
          username: 'user',
          password: 'user'
        },
        {
          username: 'admin',
          password: 'admin'
        }
      ]);
    }

    this.isInit.resolve();
  }
}

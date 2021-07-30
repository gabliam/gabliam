import Lokijs from 'lokijs';
import { User } from '../entities/user';

export class LokiDatabase {
  private db: Loki;

  constructor(private dbPath: string) {}

  start() {
    return new Promise(resolve => {
      this.db = new Lokijs(this.dbPath, {
        autoload: true,
        autoloadCallback: () => {
          this.initialize();
          resolve(true);
        },
        autosave: true,
        autosaveInterval: 4000
      });
    });
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
  }
}

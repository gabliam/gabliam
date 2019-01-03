import { reflection } from '@gabliam/core/src';
import { MUnit } from './decorators';
import { MongooseConfiguration } from './interfaces';
import { MongooseConnection } from './mongoose-connection';

export class MongooseConnectionManager {
  private connections: MongooseConnection[] = [];

  constructor(
    private connectionOptions: MongooseConfiguration[],
    private models: Function[]
  ) {}

  async open() {
    const connectionOptions = this.connectionOptions.map(c => {
      return {
        ...c,
        name: c.name ? c.name : 'default',
      };
    });

    const modelsByConnection = new Map<String, Function[]>();

    // add entity to the correct connection
    for (const entity of this.models) {
      let munit = getMunit(entity);
      let index = connectionOptions.findIndex(c => c.name === munit);

      if (index === -1 && munit === 'default') {
        index = 0;
        munit = connectionOptions[0].name;
      }
      if (index === -1) {
        throw new Error(`MUnit ${munit} not found`);
      }

      if (!modelsByConnection.has(munit)) {
        modelsByConnection.set(munit, []);
      }

      modelsByConnection.get(munit)!.push(entity);
    }

    for (const connectionOption of connectionOptions) {
      this.connections.push(
        new MongooseConnection(
          connectionOption.name,
          connectionOption,
          modelsByConnection.get(connectionOption.name) || []
        )
      );
    }
  }

  async close() {
    await Promise.all(this.connections.map(c => c.conn.close()));
  }

  getConnection(name: string) {
    const connection = this.connections.find(c => c.name === name);
    if (!connection) {
      throw new Error(`Connection ${name} not found`);
    }
    return connection;
  }

  getDefaultConnection() {
    const connection = this.connections.find(c => c.name === 'default');
    if (connection === undefined) {
      return this.connections[0];
    } else {
      return connection;
    }
  }
}

const getMunit = (cls: any) => {
  const [munit] = reflection
    .annotationsOfDecorator<MUnit>(cls, MUnit)
    .slice(-1);
  return munit ? munit.name || 'default' : 'default';
};

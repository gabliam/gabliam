import { METADATA_KEY } from './constants';
import { MongooseConnection } from './mongoose-connection';
import { MongooseConfiguration } from './interfaces';

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
        name: c.name ? c.name : 'default'
      };
    });

    const modelsByConnection = new Map<String, Function[]>();

    // add entity to the correct connection
    for (const entity of this.models) {
      let cunit =
        <string>Reflect.getMetadata(METADATA_KEY.munit, entity) || 'default';
      let index = connectionOptions.findIndex(c => c.name === cunit);

      if (index === -1 && cunit === 'default') {
        index = 0;
        cunit = connectionOptions[0].name;
      }
      if (index === -1) {
        throw new Error(`CUnit ${cunit} not found`);
      }

      if (!modelsByConnection.has(cunit)) {
        modelsByConnection.set(cunit, []);
      }

      modelsByConnection.get(cunit)!.push(entity);
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

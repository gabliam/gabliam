import d from 'debug';
import { createConnections } from 'typeorm';
import { GabliamConnectionOptionsReader } from './connection-options-reader';
import { TypeormConnectionNotFoundError } from './errors';
import { Connection } from './typeorm';

const debug = d('Gabliam:Plugin:Typeorm:ConnectionManager');

export class ConnectionManager {
  private connections!: Connection[];

  constructor(public connectionOptionsReader: GabliamConnectionOptionsReader) {}

  async open() {
    const options = await this.connectionOptionsReader.all();
    debug(options);
    this.connections = await createConnections(options);
  }

  async close() {
    await Promise.all(this.connections.map((c) => c.close()));
  }

  getConnection(name: string) {
    const connection = this.connections.find((c) => c.name === name);
    if (!connection) {
      throw new TypeormConnectionNotFoundError(name);
    }
    return connection;
  }

  getDefaultConnection() {
    const connection = this.connections.find((c) => c.name === 'default');
    if (connection === undefined) {
      return this.connections[0];
    }
    return connection;
  }
}

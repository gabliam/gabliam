import { createConnections } from 'typeorm';
import { GabliamConnectionOptionsReader } from './connection-options-reader';
import { TypeormConnectionNotFoundError } from './errors';
import { Connection } from './typeorm';

export class ConnectionManager {
  private connections!: Connection[];

  constructor(public connectionOptionsReader: GabliamConnectionOptionsReader) {}

  async open() {
    this.connections = await createConnections(
      await this.connectionOptionsReader.all()
    );
  }

  async close() {
    await Promise.all(this.connections.map(c => c.close()));
  }

  getConnection(name: string) {
    const connection = this.connections.find(c => c.name === name);
    if (!connection) {
      throw new TypeormConnectionNotFoundError(name);
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

import { reflection, ValueExtractor } from '@gabliam/core';
import { createConnections } from 'typeorm';
import {
  TypeormConnectionNotFoundError,
  TypeormCUnitNotFoundError,
} from './errors';
import { CUnit } from './metadatas';
import { Connection, ConnectionOptions } from './typeorm';

export class ConnectionManager {
  private connections!: Connection[];

  constructor(
    private connectionOptions: ConnectionOptions[],
    private entities: Function[],
    private valueExtractor: ValueExtractor
  ) {}

  async open() {
    const connectionOptions = this.connectionOptions.map(c => {
      return {
        ...c,
        entities: Array.isArray(c.entities) ? c.entities : [],
        name: c.name ? c.name : 'default',
      };
    });

    // add entity to the correct connection
    for (const entity of this.entities) {
      const cunits = getCunits(entity);

      for (let cunit of cunits) {
        cunit = this.valueExtractor(cunit, cunit);
        let index = connectionOptions.findIndex(c => c.name === cunit);

        if (index === -1 && cunit === 'default') {
          index = 0;
        }

        if (index === -1) {
          throw new TypeormCUnitNotFoundError(cunit);
        }
        (<any>connectionOptions)[index].entities.push(entity);
      }
    }

    this.connections = await createConnections(connectionOptions);
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

const getCunits = (cls: any) => {
  const cunits = reflection.annotationsOfDecorator<CUnit>(cls, CUnit);

  if (cunits.length) {
    return cunits.map(c => c.name || 'default');
  }

  return ['default'];
};

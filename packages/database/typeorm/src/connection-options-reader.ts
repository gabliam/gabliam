import { ConnectionOptionsReader, ConnectionOptions } from 'typeorm';
import { reflection, ValueExtractor } from '@gabliam/core';
import { TypeormCUnitNotFoundError } from './errors';
import { CUnit } from './metadatas';

export class GabliamConnectionOptionsReader extends ConnectionOptionsReader {
  constructor(
    private connectionOptions: ConnectionOptions[] | undefined,
    private classes: {
      entities: Function[];
      migrations: Function[];
      subscribers: Function[];
    },
    private valueExtractor: ValueExtractor,
    options?: {
      /**
       * Directory where ormconfig should be read from.
       * By default its your application root (where your app package.json is located).
       */
      root?: string | undefined;
      /**
       * Filename of the ormconfig configuration. By default its equal to "ormconfig".
       */
      configName?: string | undefined;
    }
  ) {
    super(options);
  }

  async load(): Promise<ConnectionOptions[] | undefined> {
    let connectionOptions = await super.load();
    if (connectionOptions === undefined && this.connectionOptions) {
      connectionOptions = this.connectionOptions.map(c => {
        return {
          ...c,
          entities: Array.isArray(c.entities) ? c.entities : [],
          migrations: Array.isArray(c.migrations) ? c.migrations : [],
          subscribers: Array.isArray(c.subscribers) ? c.subscribers : [],
          name: c.name ? c.name : 'default',
        };
      });
    }

    if (connectionOptions) {
      connectionOptions = connectionOptions.map(c => ({
        ...c,
        entities: Array.isArray(c.entities) ? c.entities : [],
        migrations: Array.isArray(c.migrations) ? c.migrations : [],
        subscribers: Array.isArray(c.subscribers) ? c.subscribers : [],
        name: c.name ? c.name : 'default',
      }));

      this.populateConnectionOptions(
        this.classes.entities,
        connectionOptions,
        'entities'
      );
      this.populateConnectionOptions(
        this.classes.migrations,
        connectionOptions,
        'migrations'
      );
      this.populateConnectionOptions(
        this.classes.subscribers,
        connectionOptions,
        'subscribers'
      );
    }
    return connectionOptions;
  }

  buildNew(options?: {
    /**
     * Directory where ormconfig should be read from.
     * By default its your application root (where your app package.json is located).
     */
    root?: string | undefined;
    /**
     * Filename of the ormconfig configuration. By default its equal to "ormconfig".
     */
    configName?: string | undefined;
  }) {
    return new GabliamConnectionOptionsReader(
      this.connectionOptions,
      this.classes,
      this.valueExtractor,
      options
    );
  }

  private populateConnectionOptions(
    classes: Function[],
    connectionOptions: ConnectionOptions[],
    type: 'entities' | 'migrations' | 'subscribers'
  ) {
    for (const clazz of classes) {
      const cunits = getCunits(clazz);

      for (let cunit of cunits) {
        cunit = this.valueExtractor(cunit, cunit);
        let index = connectionOptions.findIndex(c => c.name === cunit);

        if (index === -1 && cunit === 'default') {
          index = 0;
        }

        if (index === -1) {
          throw new TypeormCUnitNotFoundError(cunit);
        }
        (<any>connectionOptions)[index][type].push(clazz);
      }
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

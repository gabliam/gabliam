import { ConnectionOptionsReader, ConnectionOptions } from 'typeorm';
import { reflection, ValueExtractor } from '@gabliam/core';
import { TypeormCUnitNotFoundError } from './errors';
import { CUnit } from './metadatas';

export class GabliamConnectionOptionsReader extends ConnectionOptionsReader {
  constructor(
    private connectionOptions: ConnectionOptions[] | undefined,
    private entities: Function[],
    private valueExtractor: ValueExtractor,
    options?:
      | {
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
      | undefined
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
          name: c.name ? c.name : 'default',
        };
      });
    }

    if (connectionOptions) {
      connectionOptions = connectionOptions.map(c => ({
        ...c,
        entities: Array.isArray(c.entities) ? c.entities : [],
        name: c.name ? c.name : 'default',
      }));

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
    }
    return connectionOptions;
  }

  buildNew(
    options?:
      | {
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
      | undefined
  ) {
    return new GabliamConnectionOptionsReader(
      this.connectionOptions,
      this.entities,
      this.valueExtractor,
      options
    );
  }
}

const getCunits = (cls: any) => {
  const cunits = reflection.annotationsOfDecorator<CUnit>(cls, CUnit);

  if (cunits.length) {
    return cunits.map(c => c.name || 'default');
  }

  return ['default'];
};

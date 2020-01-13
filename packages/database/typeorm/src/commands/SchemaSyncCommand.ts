import { createConnection } from '../index';
import { Connection } from 'typeorm';
import { CommandUtils } from './CommandUtils';
import * as yargs from 'yargs';
const chalk = require('chalk');

export interface SchemaSyncCommandArgs {
  app?: string;

  connection: string;

  config: string;
}

/**
 * Synchronizes database schema with entities.
 */
export class SchemaSyncCommand
  implements yargs.CommandModule<{}, SchemaSyncCommandArgs> {
  command = 'schema:sync';
  describe =
    'Synchronizes your entities with database schema. It runs schema update queries on all connections you have. ' +
    'To run update queries on a concrete connection use -c option.';

  builder(args: yargs.Argv) {
    return args
      .options('app', {
        alias: 'a',
        describe: 'Name of application to select if many',
        type: 'string',
      })
      .option('connection', {
        alias: 'c',
        default: 'default',
        describe:
          'Name of the connection on which schema synchronization needs to to run.',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  async handler(args: yargs.Arguments<SchemaSyncCommandArgs>) {
    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = await CommandUtils.getGabliamConnectionOptionsReader(
        {
          root: process.cwd(),
          configName: args.config,
        },
        args.app
      );
      const connectionOptions = await connectionOptionsReader.get(
        args.connection
      );
      Object.assign(connectionOptions, {
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ['query', 'schema'],
      });
      connection = await createConnection(connectionOptions);
      await connection.synchronize();
      await connection.close();

      console.log(chalk.green('Schema syncronization finished successfully.'));
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during schema synchronization:'));
      console.error(err);
      process.exit(1);
    }
  }
}

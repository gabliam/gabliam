/* eslint-disable no-console */
import chalk from 'chalk';
import process from 'process';
import yargs from 'yargs';
import { Connection, createConnection } from '../index';
import { CommandUtils } from './CommandUtils';

export interface MigrationShowCommandArgs {
  app?: string;

  connection: string;

  config: string;
}

/**
 * Runs migration command.
 */
export class MigrationShowCommand
  implements yargs.CommandModule<{}, MigrationShowCommandArgs> {
  command = 'migration:show';

  describe = 'Show all migrations and whether they have been run or not';

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
        describe: 'Name of the connection on which run a query.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<MigrationShowCommandArgs>) {
    let connection: Connection | undefined;
    try {
      const connectionOptionsReader = await CommandUtils.getGabliamConnectionOptionsReader(
        {
          root: process.cwd(),
          configName: args.config,
        },
        args.app,
      );
      const connectionOptions = await connectionOptionsReader.get(
        args.connection,
      );
      Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ['query', 'error', 'schema'],
      });
      connection = await createConnection(connectionOptions);
      const unappliedMigrations = await connection.showMigrations();
      await connection.close();

      // return error code if there are unapplied migrations for CI
      process.exit(unappliedMigrations ? 1 : 0);
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during migration show:'));
      console.error(err);
      process.exit(1);
    }
  }
}

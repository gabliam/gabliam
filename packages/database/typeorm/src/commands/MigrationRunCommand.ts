import { createConnection, Connection } from '../index';
import { CommandUtils } from './CommandUtils';
import process from 'process';
import yargs from 'yargs';
import chalk from 'chalk';

export interface MigrationRunCommandArgs {
  app?: string;

  connection: string;

  config: string;

  transaction?: string;
}

/**
 * Runs migration command.
 */
export class MigrationRunCommand
  implements yargs.CommandModule<{}, MigrationRunCommandArgs> {
  command = 'migration:run';
  describe = 'Runs all pending migrations.';

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
      .option('transaction', {
        alias: 't',
        default: 'default',
        describe:
          'Indicates if transaction should be used or not for migration run. Enabled by default.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<MigrationRunCommandArgs>) {
    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = await CommandUtils.getGabliamConnectionOptionsReader(
        {
          root: process.cwd(),
          configName: args.config as any,
        },
        args.app,
      );

      const connectionOptions = await connectionOptionsReader.get(
        args.connection as any,
      );
      Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ['query', 'error', 'schema'],
      });
      connection = await createConnection(connectionOptions);

      const options = {
        transaction: 'all' as 'all' | 'none' | 'each',
      };

      switch (args.t) {
        case 'all':
          options.transaction = 'all';
          break;
        case 'none':
        case 'false':
          options.transaction = 'none';
          break;
        case 'each':
          options.transaction = 'each';
          break;
        default:
        // noop
      }

      await connection.runMigrations(options);
      await connection.close();
      // exit process if no errors
      process.exit(0);
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during migration run:'));
      console.error(err);
      process.exit(1);
    }
  }
}

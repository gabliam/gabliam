import { createConnection, Connection } from '../index';
import { CommandUtils } from './CommandUtils';
import yargs from 'yargs';
import chalk from 'chalk';

export interface MigrationRevertCommandArgs {
  app?: string;

  connection: string;

  config: string;

  transaction?: string;
}

/**
 * Reverts last migration command.
 */
export class MigrationRevertCommand
  implements yargs.CommandModule<{}, MigrationRevertCommandArgs> {
  command = 'migration:revert';
  describe = 'Reverts last executed migration.';

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
      })
      .option('transaction', {
        alias: 't',
        default: 'default',
        describe:
          'Indicates if transaction should be used or not for migration revert. Enabled by default.',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  async handler(args: yargs.Arguments<MigrationRevertCommandArgs>) {
    let connection: Connection | undefined = undefined;
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

      await connection.undoLastMigration(options);
      await connection.close();
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during migration revert:'));
      console.error(err);
      process.exit(1);
    }
  }
}

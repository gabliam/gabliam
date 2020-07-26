import { Connection } from 'typeorm';
import yargs from 'yargs';
import { createConnection } from '../index';
import { CommandUtils } from './CommandUtils';
const chalk = require('chalk');

interface CacheClearCommandArgs {
  app?: string;

  connection: string;

  config: string;
}

/**
 * Clear cache command.
 */
export class CacheClearCommand
  implements yargs.CommandModule<{}, CacheClearCommandArgs> {
  command = 'cache:clear';
  describe = 'Clears all data stored in query runner cache.';

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
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  async handler(args: yargs.Arguments<CacheClearCommandArgs>) {
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
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ['schema'],
      });
      connection = await createConnection(connectionOptions);

      if (!connection.queryResultCache) {
        console.log(
          chalk.black.bgRed(
            'Cache is not enabled. To use cache enable it in connection configuration.'
          )
        );
        return;
      }

      await connection.queryResultCache.clear();
      console.log(chalk.green('Cache was successfully cleared'));

      if (connection) {
        await connection.close();
      }
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during cache clear:'));
      console.error(err);
      process.exit(1);
    }
  }
}

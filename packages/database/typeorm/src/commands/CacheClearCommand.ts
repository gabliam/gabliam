import { gabliamBuilder, gabliamFindApp, setupTsProject } from '@gabliam/core';
import { Connection } from 'typeorm';
import * as yargs from 'yargs';
import { GabliamConnectionOptionsReader } from '../connection-options-reader';
import { createConnection } from '../index';
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

  async handler(args: CacheClearCommandArgs) {
    await setupTsProject(process.cwd());
    const appName = args.app;

    let connection: Connection | undefined = undefined;
    try {
      const application = await gabliamFindApp(process.cwd(), appName);
      const gabliam = await (await gabliamBuilder(application)).build();
      const connectionOptionsReader = gabliam.container
        .get(GabliamConnectionOptionsReader)
        .buildNew({
          root: process.cwd(),
          configName: args.config as any,
        });
      const connectionOptions = await connectionOptionsReader.get(
        args.connection as any
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
        await (connection as Connection).close();
      }

      console.log(chalk.black.bgRed('Error during cache clear:'));
      console.error(err);
      process.exit(1);
    }
  }
}

import { createConnection, Connection } from '../index';
import { CommandUtils } from './CommandUtils';
import { highlight } from 'cli-highlight';
import yargs from 'yargs';

import chalk from 'chalk';

interface SchemaLogCommandArgs {
  app?: string;

  connection: string;

  config: string;
}

/**
 * Shows sql to be executed by schema:sync command.
 */
export class SchemaLogCommand
  implements yargs.CommandModule<{}, SchemaLogCommandArgs> {
  command = 'schema:log';
  describe =
    'Shows sql to be executed by schema:sync command. It shows sql log only for your default connection. ' +
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
          'Name of the connection of which schema sync log should be shown.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<SchemaLogCommandArgs>) {
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
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: false,
      });

      connection = await createConnection(connectionOptions);
      const sqlInMemory = await connection.driver.createSchemaBuilder().log();
      if (sqlInMemory.upQueries.length === 0) {
        console.log(
          chalk.yellow(
            'Your schema is up to date - there are no queries to be executed by schema syncronization.',
          ),
        );
      } else {
        const lengthSeparators = String(sqlInMemory.upQueries.length)
          .split('')
          .map((char) => '-')
          .join('');
        console.log(
          chalk.yellow(
            '---------------------------------------------------------------' +
              lengthSeparators,
          ),
        );
        console.log(
          chalk.yellow.bold(
            `-- Schema syncronization will execute following sql queries (${chalk.white(
              sqlInMemory.upQueries.length,
            )}):`,
          ),
        );
        console.log(
          chalk.yellow(
            '---------------------------------------------------------------' +
              lengthSeparators,
          ),
        );

        sqlInMemory.upQueries.forEach((upQuery: any) => {
          let sqlString = upQuery.query;
          sqlString = sqlString.trim();
          sqlString =
            sqlString.substr(-1) === ';' ? sqlString : sqlString + ';';
          console.log(highlight(sqlString));
        });
      }
      await connection.close();
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

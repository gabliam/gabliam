import { createConnection, Connection } from '../index';
import { CommandUtils } from './CommandUtils';
import yargs from 'yargs';
const chalk = require('chalk');

interface SchemaDropCommandArgs {
  app?: string;

  connection: string;

  config: string;
}

/**
 * Drops all tables of the database from the given connection.
 */
export class SchemaDropCommand
  implements yargs.CommandModule<{}, SchemaDropCommandArgs> {
  command = 'schema:drop';
  describe =
    'Drops all tables in the database on your default connection. ' +
    `To drop table of a concrete connection's database use -c option.`;

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
        describe: 'Name of the connection on which to drop all tables.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<SchemaDropCommandArgs>) {
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
      await connection.dropDatabase();
      await connection.close();

      console.log(
        chalk.green('Database schema has been successfully dropped.')
      );
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during schema drop:'));
      console.error(err);
      process.exit(1);
    }
  }
}

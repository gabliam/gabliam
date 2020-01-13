import { createConnection, QueryRunner, Connection } from '../index';
import { CommandUtils } from './CommandUtils';
import * as yargs from 'yargs';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
const chalk = require('chalk');

interface QueryCommandArgs {
  app?: string;

  connection: string;

  config: string;
}

/**
 * Executes an sql query on the given connection.
 */
export class QueryCommand implements yargs.CommandModule<{}, QueryCommandArgs> {
  command = 'query';
  describe =
    'Executes given SQL query on a default connection. Specify connection name to run query on a specific connection.';

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
        describe: 'Name of the connection on which to run a query.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<QueryCommandArgs>) {
    let connection: Connection | undefined = undefined;
    let queryRunner: QueryRunner | undefined = undefined;
    try {
      // create a connection
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
        logging: false,
      });
      connection = await createConnection(connectionOptions);

      // create a query runner and execute query using it
      queryRunner = connection.createQueryRunner('master');
      console.log(
        chalk.green('Running query: ') + PlatformTools.highlightSql(args._[1])
      );
      const queryResult = await queryRunner.query(args._[1]);
      console.log(chalk.green('Query has been executed. Result: '));
      console.log(
        PlatformTools.highlightJson(JSON.stringify(queryResult, undefined, 2))
      );

      await queryRunner.release();
      await connection.close();
    } catch (err) {
      if (queryRunner) {
        await queryRunner.release();
      }
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during query execution:'));
      console.error(err);
      process.exit(1);
    }
  }
}

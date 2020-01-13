import * as yargs from 'yargs';
import { camelCase } from '../string-utils';
import { CommandUtils } from './CommandUtils';
const chalk = require('chalk');

export interface MigrationCreateCommandArgs {
  app?: string;

  connection: string;

  config: string;

  name: string;

  dir?: string;
}

/**
 * Creates a new migration file.
 */
export class MigrationCreateCommand
  implements yargs.CommandModule<{}, MigrationCreateCommandArgs> {
  // -------------------------------------------------------------------------
  // Protected Static Methods
  // -------------------------------------------------------------------------

  /**
   * Gets contents of the migration file.
   */
  protected static getTemplate(
    name: string,
    timestamp: number,
    connection: string
  ): string {
    return `import { MigrationInterface, QueryRunner, MigrationEntity${
      connection === 'default' ? ' ' : ', CUnit '
    }} from '@gabliam/typeorm';
${
  connection === 'default'
    ? ''
    : `
@CUnit('${connection}')`
}
@MigrationEntity()
export class ${camelCase(
      name,
      true
    )}${timestamp} implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
`;
  }

  command = 'migration:create';
  describe = 'Creates a new migration file.';

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
      .option('name', {
        alias: 'n',
        describe: 'Name of the migration class.',
        demand: true,
        type: 'string',
      })
      .option('dir', {
        alias: 'd',
        describe: 'Directory where migration should be created.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<MigrationCreateCommandArgs>) {
    try {
      const timestamp = new Date().getTime();
      const fileContent = MigrationCreateCommand.getTemplate(
        args.name,
        timestamp,
        args.connection
      );
      const filename = timestamp + '-' + args.name + '.ts';
      let directory = args.dir;

      // if directory is not set then try to open tsconfig and find default path there
      if (!directory) {
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
          directory = connectionOptions.cli
            ? connectionOptions.cli.migrationsDir
            : undefined;
        } catch (err) {}
      }

      const path =
        process.cwd() + '/' + (directory ? directory + '/' : '') + filename;
      await CommandUtils.createFile(path, fileContent);
      console.log(
        `Migration ${chalk.blue(path)} has been generated successfully.`
      );
    } catch (err) {
      console.log(chalk.black.bgRed('Error during migration creation:'));
      console.error(err);
      process.exit(1);
    }
  }
}

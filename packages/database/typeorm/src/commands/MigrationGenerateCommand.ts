import { CommandUtils } from './CommandUtils';
import { Connection, createConnection } from '../index';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { camelCase } from '../string-utils';
import yargs from 'yargs';
import { AuroraDataApiDriver } from 'typeorm/driver/aurora-data-api/AuroraDataApiDriver';
const chalk = require('chalk');

export interface MigrationGenerateCommandArgs {
  app?: string;

  connection: string;

  config: string;

  name: string;

  dir?: string;
}

/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */
export class MigrationGenerateCommand
  implements yargs.CommandModule<{}, MigrationGenerateCommandArgs> {
  // -------------------------------------------------------------------------
  // Protected Static Methods
  // -------------------------------------------------------------------------

  /**
   * Gets contents of the migration file.
   */
  protected static getTemplate(
    name: string,
    timestamp: number,
    upSqls: string[],
    downSqls: string[],
    connection: string
  ): string {
    const migrationName = `${camelCase(name, true)}${timestamp}`;

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
export class ${migrationName} implements MigrationInterface {
  name = '${migrationName}'

  public async up(queryRunner: QueryRunner): Promise<any> {
${upSqls.join(`
`)}
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
${downSqls.join(`
`)}
  }

}
`;
  }

  command = 'migration:generate';
  describe =
    'Generates a new migration file with sql needs to be executed to update schema.';

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

  async handler(args: yargs.Arguments<MigrationGenerateCommandArgs>) {
    const timestamp = new Date().getTime();
    const filename = timestamp + '-' + args.name + '.ts';
    let directory = args.dir;

    const connectionOptionsReaderBuilder = await CommandUtils.getGabliamConnectionOptionsReader(
      undefined,
      args.app
    );

    // if directory is not set then try to open tsconfig and find default path there
    if (!directory) {
      try {
        const connectionOptionsReader = connectionOptionsReaderBuilder.buildNew(
          {
            root: process.cwd(),
            configName: args.config,
          }
        );
        const connectionOptions = await connectionOptionsReader.get(
          args.connection
        );
        directory = connectionOptions.cli
          ? connectionOptions.cli.migrationsDir
          : undefined;
      } catch (err) {}
    }

    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = connectionOptionsReaderBuilder.buildNew({
        root: process.cwd(),
        configName: args.config,
      });
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
      const sqlInMemory = await connection.driver.createSchemaBuilder().log();
      const upSqls: string[] = [],
        downSqls: string[] = [];

      // mysql is exceptional here because it uses ` character in to escape names in queries, that's why for mysql
      // we are using simple quoted string instead of template string syntax
      if (
        connection.driver instanceof MysqlDriver ||
        connection.driver instanceof AuroraDataApiDriver
      ) {
        sqlInMemory.upQueries.forEach(upQuery => {
          upSqls.push(
            '        await queryRunner.query("' +
              upQuery.query.replace(new RegExp(`"`, 'g'), `\\"`) +
              '", ' +
              JSON.stringify(upQuery.parameters) +
              ');'
          );
        });
        sqlInMemory.downQueries.forEach(downQuery => {
          downSqls.push(
            '        await queryRunner.query("' +
              downQuery.query.replace(new RegExp(`"`, 'g'), `\\"`) +
              '", ' +
              JSON.stringify(downQuery.parameters) +
              ');'
          );
        });
      } else {
        sqlInMemory.upQueries.forEach(upQuery => {
          upSqls.push(
            '        await queryRunner.query(`' +
              upQuery.query.replace(new RegExp('`', 'g'), '\\`') +
              '`, ' +
              JSON.stringify(upQuery.parameters) +
              ');'
          );
        });
        sqlInMemory.downQueries.forEach(downQuery => {
          downSqls.push(
            '        await queryRunner.query(`' +
              downQuery.query.replace(new RegExp('`', 'g'), '\\`') +
              '`, ' +
              JSON.stringify(downQuery.parameters) +
              ');'
          );
        });
      }

      if (upSqls.length) {
        if (args.name) {
          const fileContent = MigrationGenerateCommand.getTemplate(
            args.name,
            timestamp,
            upSqls,
            downSqls.reverse(),
            args.connection
          );
          const path =
            process.cwd() + '/' + (directory ? directory + '/' : '') + filename;
          await CommandUtils.createFile(path, fileContent);

          console.log(
            chalk.green(
              `Migration ${chalk.blue(path)} has been generated successfully.`
            )
          );
        } else {
          console.log(chalk.yellow('Please specify migration name'));
        }
      } else {
        console.log(
          chalk.yellow(
            `No changes in database schema were found - cannot generate a migration. To create a new empty migration use "typeorm migration:create" command`
          )
        );
      }
      await connection.close();
    } catch (err) {
      if (connection) {
        await connection.close();
      }

      console.log(chalk.black.bgRed('Error during migration generation:'));
      console.error(err);
      process.exit(1);
    }
  }
}

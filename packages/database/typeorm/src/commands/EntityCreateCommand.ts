import { resolve } from 'path';
import * as yargs from 'yargs';
import { camelCase } from '../string-utils';
import { CommandUtils } from './CommandUtils';
const chalk = require('chalk');

export interface EntityCreateCommandArgs {
  app?: string;

  connection: string;

  config: string;

  name: string;

  dir?: string;
}

/**
 * Generates a new entity.
 */
export class EntityCreateCommand
  implements yargs.CommandModule<{}, EntityCreateCommandArgs> {
  /**
   * Gets contents of the entity file.
   */
  protected static getTemplate(name: string, connection: string): string {
    return `import { Entity${
      connection === 'default' ? ' ' : ', CUnit '
    }} from '@gabliam/typeorm';
${
  connection === 'default'
    ? ''
    : `
@CUnit('${connection}')`
}
@Entity()
export class ${camelCase(name, true)} {

}
`;
  }
  command = 'entity:create';
  describe = 'Generates a new entity.';

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
        describe: 'Name of the connection on which to run a query',
      })
      .option('name', {
        alias: 'n',
        describe: 'Name of the entity class.',
        demand: true,
        type: 'string',
      })
      .option('dir', {
        alias: 'd',
        describe: 'Directory where entity should be created.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  async handler(args: yargs.Arguments<EntityCreateCommandArgs>) {
    try {
      const fileContent = EntityCreateCommand.getTemplate(
        args.name,
        args.connection
      );
      const filename = args.name + '.ts';
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
            ? connectionOptions.cli.entitiesDir
            : undefined;
        } catch (err) {}
      }

      const path = resolve(
        process.cwd() + '/',
        directory ? directory + '/' : '',
        filename
      );

      const fileExists = await CommandUtils.fileExists(path);
      if (fileExists) {
        throw new Error(`File ${chalk.blue(path)} already exists`);
      }
      await CommandUtils.createFile(path, fileContent);
      console.log(
        chalk.green(`Entity ${chalk.blue(path)} has been created successfully.`)
      );
    } catch (err) {
      console.log(chalk.black.bgRed('Error during entity creation:'));
      console.error(err);
      process.exit(1);
    }
  }
}

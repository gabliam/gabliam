import { CommandUtils } from './CommandUtils';
import yargs from 'yargs';
import { camelCase } from '../string-utils';
import chalk from 'chalk';

export interface SubscriberCreateCommandArgs {
  app?: string;

  connection: string;

  config: string;

  name: string;

  dir?: string;
}

/**
 * Generates a new subscriber.
 */
export class SubscriberCreateCommand
  implements yargs.CommandModule<{}, SubscriberCreateCommandArgs> {
  /**
   * Gets contents of the entity file.
   */
  protected static getTemplate(name: string, connection: string): string {
    return `import { EventSubscriber, EntitySubscriberInterface${
      connection === 'default' ? ' ' : ', CUnit '
    }} from '@gabliam/typeorm';
${
  connection === 'default'
    ? ''
    : `
@CUnit('${connection}')`
}
@EventSubscriber()
export class ${camelCase(
      name + 'Subscriber',
      true,
    )} implements EntitySubscriberInterface<any> {

}
`;
  }

  command = 'subscriber:create';
  describe = 'Generates a new subscriber.';

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
        type: 'string',
      })
      .option('name', {
        alias: 'n',
        describe: 'Name of the subscriber class.',
        demand: true,
        type: 'string',
      })
      .option('dir', {
        alias: 'd',
        describe: 'Directory where subscriber should be created.',
        type: 'string',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
        type: 'string',
      });
  }

  async handler(args: yargs.Arguments<SubscriberCreateCommandArgs>) {
    try {
      const fileContent = SubscriberCreateCommand.getTemplate(
        args.name,
        args.connection,
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
            args.app,
          );
          const connectionOptions = await connectionOptionsReader.get(
            args.connection,
          );
          directory = connectionOptions.cli
            ? connectionOptions.cli.subscribersDir
            : undefined;
        } catch (err) {}
      }

      const path =
        process.cwd() + '/' + (directory ? directory + '/' : '') + filename;
      await CommandUtils.createFile(path, fileContent);
      console.log(
        chalk.green(
          `Subscriber ${chalk.blue(path)} has been created successfully.`,
        ),
      );
    } catch (err) {
      console.log(chalk.black.bgRed('Error during subscriber creation:'));
      console.error(err);
      process.exit(1);
    }
  }
}

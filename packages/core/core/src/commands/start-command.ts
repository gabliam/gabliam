import * as yargs from 'yargs';
import { gabliamBuilder, gabliamFindApp } from '../gabliam-utils';

interface StartCommandArgs {
  app?: string;

  ts?: boolean;
}

export class StartCommand implements yargs.CommandModule<{}, StartCommandArgs> {
  command = 'start';
  describe = 'Start a gabliam application';

  builder(args: yargs.Argv) {
    return args
      .options('app', {
        alias: 'a',
        describe: 'Name of application to select if many',
        type: 'string',
      })
      .options('ts', {
        alias: 't',
        describe: 'Add typescript interpretor',
        type: 'boolean',
      });
  }

  async handler(args: StartCommandArgs) {
    const appName = args.app;
    if (args.ts === true) {
      const tsnode = require('ts-node');
      tsnode.register({
        dir: process.cwd(),
      });
      module.require('tsconfig-paths/register');
    }

    const application = await gabliamFindApp(process.cwd(), appName);
    const gabliam = await gabliamBuilder(application);
    ['SIGINT', 'SIGTERM'].forEach((sig: any) => {
      process.on(sig, async () => {
        try {
          await gabliam.stopAndDestroy();
        } catch {}

        process.exit();
      });
    });

    gabliam.buildAndStart();
  }
}

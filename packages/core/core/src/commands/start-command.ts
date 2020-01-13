import * as yargs from 'yargs';
import {
  gabliamBuilder,
  gabliamFindApp,
  setupTsProject,
} from '../gabliam-utils';

interface StartCommandArgs {
  app?: string;
}

export class StartCommand implements yargs.CommandModule<{}, StartCommandArgs> {
  command = 'start';
  describe = 'Start a gabliam application';

  builder(args: yargs.Argv) {
    return args.options('app', {
      alias: 'a',
      describe: 'Name of application to select if many',
      type: 'string',
    });
  }

  async handler(args: StartCommandArgs) {
    const appName = args.app;
    await setupTsProject(process.cwd());

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

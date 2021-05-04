import _ from 'lodash';
import yargs from 'yargs';
import {
  gabliamBuilder,
  gabliamFindApp,
  setupTsProject,
} from '../gabliam-utils';
import { resolvePath } from '../metadatas/path-utils';

interface StartCommandArgs {
  app?: string;

  dir?: string;
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
      .options('dir', {
        alias: 'd',
        describe: 'Directory to scan',
        type: 'string',
      });
  }

  async handler(args: StartCommandArgs) {
    const appName = args.app;
    let dirToScan = process.cwd();
    if (args.dir) {
      dirToScan = resolvePath(args.dir, process.cwd());
    }

    await setupTsProject(dirToScan);

    const application = await gabliamFindApp(dirToScan, appName);
    const gabliam = gabliamBuilder(application)();
    ['SIGINT', 'SIGTERM'].forEach((sig: any) => {
      process.on(sig, async () => {
        try {
          await gabliam.stopAndDestroy();
          // eslint-disable-next-line no-empty
        } catch {}

        process.exit();
      });
    });

    await gabliam.buildAndStart();
    // eslint-disable-next-line new-cap
    const app = new application();
    if (_.isFunction(app.run)) {
      app.run(gabliam);
    }
  }
}

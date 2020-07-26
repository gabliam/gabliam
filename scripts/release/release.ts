import ora from 'ora';
import { build, removeOld } from './utils/dist-utils';
import { parseParams } from './utils/parse-params-release';
import { confirm } from './utils/prompt-utils';
import { promptVersion } from './utils/prompt-version';
import { publish } from './utils/publish';
import { verifyWorkingTreeClean } from './utils/verify-working-tree-clean';

const run = async () => {
  const params = parseParams();
  await verifyWorkingTreeClean();
  const version = await promptVersion(params);
  const cont = await confirm(`Confirm to publish version: ${version}`);

  if (cont === false) {
    console.log('Aborting');
    process.exit(1);
    return;
  }

  const spinner = ora('Remove old build').start();
  await removeOld();
  spinner.text = 'Build';
  await build(spinner, version);
  await publish(spinner, params, version);
  spinner.succeed('Publish success');
};

run();

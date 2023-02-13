import ora from 'ora';
import { build, removeOld } from './utils/dist-utils.mjs';
import { parseParams } from './utils/parse-params-release.mjs';
import { confirm } from './utils/prompt-utils.mjs';
import { promptVersion } from './utils/prompt-version.mjs';
import { publish } from './utils/publish.mjs';
import { verifyWorkingTreeClean } from './utils/verify-working-tree-clean.mjs';

export const releaseCommand = async () => {
  const params = parseParams();
  await verifyWorkingTreeClean();
  const version = await promptVersion(params);
  await confirm(`Confirm to publish version: ${version}`);

  const spinner = ora('Remove old build').start();
  await removeOld();
  spinner.text = 'Build';
  await build(spinner, version);
  spinner.succeed('Build success');
  await confirm(`BUILD OK, Confirm to publish version: ${version}`);
  await publish(spinner, params, version);
  spinner.succeed('Publish success');
};

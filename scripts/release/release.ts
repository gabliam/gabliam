import { promptVersion } from './utils/prompt-version';
import { parseParams } from './utils/parse-params-release';
import { verifyWorkingTreeClean } from './utils/verify-working-tree-clean';
import { removeOld, build } from './utils/dist-utils';

const run = async () => {
  const params = parseParams();
  await verifyWorkingTreeClean();
  const version = await promptVersion(params.preid);
  await removeOld();
  await build(version);
  process.exit(0);
};

run();

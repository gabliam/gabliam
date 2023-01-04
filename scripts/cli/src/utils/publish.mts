import { execa } from 'execa';
import ora from 'ora';
import path from 'path';
import { APP_DIR, DIST_DIR, monoRepo } from '../constant.mjs';
import { ReleaseParams } from './parse-params-release.mjs';

export const publish = async (
  spinner: ora.Ora,
  params: ReleaseParams,
  version: string,
) => {
  const publishArgs = ['publish', '--access=public'];
  if (params.canary) {
    publishArgs.push(`--tag=canary`);
  }

  for (const [pkgName, { pkg, folder }] of Object.entries(monoRepo)) {
    if (pkg.private) {
      continue;
    }
    spinner.text = `Publish ${pkgName}`;
    const pkgDist = path.resolve(DIST_DIR, path.relative(APP_DIR, folder));
    await execa('npm', publishArgs, { cwd: pkgDist });
  }
  spinner.text = `Git add`;
  await execa(`git`, `add -u`.split(' '), { cwd: APP_DIR });
  spinner.text = `Git commit`;
  await execa(`git`, ['commit', '-m', `"release v${version}"`], {
    cwd: APP_DIR,
  });
  spinner.text = `Git tag`;
  await execa(`git`, `tag -a "v${version}"`.split(' '), {
    cwd: APP_DIR,
  });
};

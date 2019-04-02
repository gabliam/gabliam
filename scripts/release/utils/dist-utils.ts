import * as execa from 'execa';
import * as fs from 'fs-extra';
import * as Graph from 'graph-data-structure';
import * as _ from 'lodash';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { APP_DIR, DIST_DIR, monoRepo } from '../constant';
import { updatePkg, updateRootPkg } from './pkg-utils';
import * as ora from 'ora';

const rimrafAsync = promisify(rimraf);

export const build = async (spinner: ora.Ora, newVersion: string) => {
  const graph = Graph();

  for (const [pkgName, config] of Object.entries(monoRepo)) {
    if (config.pkg.private === true) {
      continue;
    }
    graph.addNode(pkgName);
    if (_.has(config, 'pkg.peerDependencies')) {
      for (const [dep] of Object.entries(config.pkg.peerDependencies)) {
        if (monoRepo[dep]) {
          graph.addEdge(dep, pkgName);
        }
      }
    }
  }

  console.log(monoRepo);

  const pkgs = graph.topologicalSort();
  const licensePath = path.resolve(APP_DIR, 'LICENSE');

  for (const pkgName of pkgs) {
    spinner.text = `Build ${pkgName}`;
    await execa('lerna', `run build --scope ${pkgName}`.split(' '), {
      cwd: APP_DIR,
    });
    const { pkg, folder } = monoRepo[pkgName];
    const pkgDist = path.resolve(
      DIST_DIR,
      path.relative(APP_DIR, folder),
      'package.json'
    );
    const licenseDist = path.resolve(
      DIST_DIR,
      path.relative(APP_DIR, folder),
      'LICENSE'
    );
    pkg.version = newVersion;
    updatePkg(pkg, 'peerDependencies', newVersion);
    updatePkg(pkg, 'dependencies', newVersion);
    updatePkg(pkg, 'devDependencies', newVersion);

    await fs.writeJSON(pkgDist, pkg, { spaces: 2 });
    await fs.copy(licensePath, licenseDist);
    await fs.copy(
      path.resolve(monoRepo[pkgName].folder, 'README.md'),
      path.resolve(
        DIST_DIR,
        path.relative(APP_DIR, monoRepo[pkgName].folder),
        'README.md'
      )
    );
  }

  await updateRootPkg(newVersion);
};

export const removeOld = async () => await rimrafAsync(DIST_DIR);

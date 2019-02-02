const findPkg = require('find-pkg');
import * as fs from 'fs-extra';
import { APP_DIR, monoRepo } from '../constant';

export const getRootPkgPath = () => findPkg.sync(APP_DIR);

export const updatePkg = (pkg: any, type: string, newVersion: string) => {
  if (pkg[type]) {
    for (const [dep] of Object.entries(pkg[type])) {
      if (monoRepo[dep]) {
        pkg[type][dep] = newVersion;
      }
    }
  }
};

export const updateRootPkg = async (newVersion: string) => {
  const rootPkgPath = getRootPkgPath();
  const rootPkg = await fs.readJSON(rootPkgPath);
  rootPkg.version = newVersion;
  await fs.writeJSON(rootPkgPath, rootPkg, { spaces: 2 });
};

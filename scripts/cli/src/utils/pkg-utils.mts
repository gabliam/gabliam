import { execa } from 'execa';
import { sync } from 'find-pkg';
import fs from 'fs-extra';
import semver from 'semver';
import { APP_DIR, monoRepo } from '../constant.mjs';

export const getRootPkgPath = () => sync(APP_DIR) || '';

export const getInfoToNpm = async (tag: string) => {
  const { stdout } = await execa('npm', 'info @gabliam/core --json'.split(' '));
  return JSON.parse(stdout)['dist-tags'][tag];
};

export const getCurrentVersion = async (tag: string) => {
  const rootPkgPath = getRootPkgPath();
  const rootPkg = await fs.readJSON(rootPkgPath);
  const currentVersion = rootPkg.version;
  const npmVersion = await getInfoToNpm(tag);
  if (semver.gt(currentVersion, npmVersion)) {
    return currentVersion;
  }
  return npmVersion;
};

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

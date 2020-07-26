import fs from 'fs';
import path from 'path';

const findPkg = require('find-pkg');
const globby = require('globby');

export interface MonorepoConfigDictionnary {
  [k: string]: MonorepoConfig;
}

export interface MonorepoConfig {
  folder: string;
  pkg: any;
}

const findPkgs = (
  rootPath: string,
  globPatterns: string[],
  appDir: string
): MonorepoConfigDictionnary => {
  if (!globPatterns) {
    return {};
  }
  const globOpts = {
    cwd: rootPath,
    strict: true,
    absolute: true,
  };
  return globPatterns
    .reduce(
      (pkgs, pattern) =>
        pkgs.concat(globby.sync(path.join(pattern, 'package.json'), globOpts)),
      []
    )
    .filter(f => fs.realpathSync(f) !== appDir)
    .reduce<any>((pkgs, f) => {
      const pkg = require(f);
      pkgs[pkg.name] = {
        folder: path.dirname(path.normalize(f)),
        pkg,
      };
      return pkgs;
    }, {});
};

export const findMonorepoConfig = (
  appDir: string
): MonorepoConfigDictionnary => {
  const monoPkgPath = findPkg.sync(appDir);
  const monoPkg = monoPkgPath && require(monoPkgPath);
  const workspaces = monoPkg && monoPkg.workspaces;
  const patterns = (workspaces && workspaces.packages) || workspaces;
  const pkgs =
    patterns && findPkgs(path.dirname(monoPkgPath), patterns, appDir);

  return pkgs || {};
};

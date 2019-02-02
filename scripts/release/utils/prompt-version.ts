import * as semver from 'semver';
import * as promptUtilities from './prompt-utils';
import { getRootPkgPath } from './pkg-utils';

export const promptVersion = async (prereleaseId: string) => {
  const rootPkgPath = getRootPkgPath();
  const rootPkg = require(rootPkgPath);
  const currentVersion = rootPkg.version;
  const patch = semver.inc(currentVersion, 'patch');
  const minor = semver.inc(currentVersion, 'minor');
  const major = semver.inc(currentVersion, 'major');
  const prepatch = (<any>semver.inc)(currentVersion, 'prepatch', prereleaseId);
  const preminor = (<any>semver.inc)(currentVersion, 'preminor', prereleaseId);
  const premajor = (<any>semver.inc)(currentVersion, 'premajor', prereleaseId);

  const choice = await promptUtilities.select<string>(
    `Select a new version (currently ${currentVersion})`,
    {
      choices: [
        { value: patch, name: `Patch (${patch})` },
        { value: minor, name: `Minor (${minor})` },
        { value: major, name: `Major (${major})` },
        { value: prepatch, name: `Prepatch (${prepatch})` },
        { value: preminor, name: `Preminor (${preminor})` },
        { value: premajor, name: `Premajor (${premajor})` },
        { value: 'PRERELEASE', name: 'Custom Prerelease' },
        { value: 'CUSTOM', name: 'Custom Version' },
      ],
    }
  );

  if (choice === 'CUSTOM') {
    return promptUtilities.input('Enter a custom version', {
      filter: semver.valid,
      validate: v => v !== null || 'Must be a valid semver version',
    });
  }

  if (choice === 'PRERELEASE') {
    const defaultVersion = (<any>semver.inc)(
      currentVersion,
      'prerelease',
      prereleaseId
    );
    const prompt = `(default: "${prereleaseId}", yielding ${defaultVersion})`;

    return promptUtilities.input(`Enter a prerelease identifier ${prompt}`, {
      filter: v =>
        (<any>semver.inc)(currentVersion, 'prerelease', v || prereleaseId),
    });
  }

  return choice;
};

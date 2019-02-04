import * as semver from 'semver';
import { ReleaseParams } from './parse-params-release';
import { getCurrentVersion } from './pkg-utils';
import * as promptUtilities from './prompt-utils';

export const promptVersion = async ({ preid, tag }: ReleaseParams) => {
  const currentVersion = await getCurrentVersion(tag);
  const patch = semver.inc(currentVersion, 'patch');
  const minor = semver.inc(currentVersion, 'minor');
  const major = semver.inc(currentVersion, 'major');
  const prepatch = (<any>semver.inc)(currentVersion, 'prepatch', preid);
  const preminor = (<any>semver.inc)(currentVersion, 'preminor', preid);
  const premajor = (<any>semver.inc)(currentVersion, 'premajor', preid);

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
      preid
    );
    const prompt = `(default: "${preid}", yielding ${defaultVersion})`;

    return promptUtilities.input(`Enter a prerelease identifier ${prompt}`, {
      filter: v => (<any>semver.inc)(currentVersion, 'prerelease', v || preid),
    });
  }

  return choice;
};

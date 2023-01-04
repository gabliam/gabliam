import * as semver from 'semver';
import { ReleaseParams } from './parse-params-release.mjs';
import { getCurrentVersion } from './pkg-utils.mjs';
import * as promptUtilities from './prompt-utils.mjs';

export const promptVersion = async ({ preid, tag }: ReleaseParams): Promise<string> => {
  const currentVersion = await getCurrentVersion(tag);
  const patch = semver.inc(currentVersion, 'patch');
  const minor = semver.inc(currentVersion, 'minor');
  const major = semver.inc(currentVersion, 'major');
  const prepatch = (semver.inc as any)(currentVersion, 'prepatch', preid);
  const preminor = (semver.inc as any)(currentVersion, 'preminor', preid);
  const premajor = (semver.inc as any)(currentVersion, 'premajor', preid);

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
    const defaultVersion = (semver.inc as any)(
      currentVersion,
      'prerelease',
      preid
    );
    const prompt = `(default: "${preid}", yielding ${defaultVersion})`;

    return promptUtilities.input(`Enter a prerelease identifier ${prompt}`, {
      filter: v => (semver.inc as any)(currentVersion, 'prerelease', v || preid),
    });
  }

  return choice;
};

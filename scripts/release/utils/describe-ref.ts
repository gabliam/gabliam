import execa from 'execa';
import { APP_DIR } from '../constant';

export const describeRef = async () => {
  const { stdout } = await execa(
    'git',
    'describe --always --long --dirty --first-parent'.split(' '),
    {
      cwd: APP_DIR,
    }
  );

  return parse(stdout);
};

const parse = async (stdout: string) => {
  const minimalShaRegex = /^([0-9a-f]{7,40})(-dirty)?$/;
  // when git describe fails to locate tags, it returns only the minimal sha
  if (minimalShaRegex.test(stdout)) {
    // repo might still be dirty
    const [, sha, isDirty] = <RegExpExecArray>minimalShaRegex.exec(stdout);

    // count number of commits since beginning of time
    const refCount = await execa('git', ['rev-list', '--count', sha], {
      cwd: APP_DIR,
    });

    return { refCount, sha, isDirty: Boolean(isDirty) };
  } else {
    const [, lastTagName, lastVersion, refCount, sha, isDirty] = <
      RegExpExecArray
    >(/^((?:.*@)?(.*))-(\d+)-g([0-9a-f]+)(-dirty)?$/.exec(stdout) || []);

    return {
      lastTagName,
      lastVersion,
      refCount,
      sha,
      isDirty: Boolean(isDirty),
    };
  }
};

import { describeRef } from './describe-ref';

export const verifyWorkingTreeClean = async () => {
  const { isDirty } = await describeRef();
  if (isDirty) {
    throw new Error(
      'Working tree has uncommitted changes, please commit or remove changes before continuing.'
    );
  }
};

import ora from 'ora';
import { build, removeOld } from './utils/dist-utils.mjs';

export const buildCommand = async () => {
  const spinner = ora('Remove old build').start();
  await removeOld();
  spinner.text = 'Build';
  await build(spinner, '0.0.0-BUILD-VERSION');
  spinner.succeed('Build success');
};

import * as commandLineArgs from 'command-line-args';

const paramDefinitions = [
  {
    name: 'canany',
    type: Boolean,
    description:
      'Publish packages after every successful merge using the sha as part of the tag.',
    defaultValue: false,
  },
  {
    name: 'preid',
    type: String,
    description:
      'Specify the prerelease identifier when publishing a prerelease',
    defaultValue: 'alpha',
  },
];

export interface Params {
  canary: boolean;

  preid: string;
}

export const parseParams = (): Params => {
  const params = <Params>commandLineArgs(paramDefinitions);
  return params;
};

import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';

const paramDefinitions = [
  {
    name: 'help',
    type: Boolean,
    description: 'Show help',
    defaultValue: false,
  },
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

export interface ReleaseParams {
  canary: boolean;

  preid: string;

  help: boolean;
}

export const parseParams = (): ReleaseParams => {
  let showHelp = false;
  let params: ReleaseParams;
  try {
    params = <ReleaseParams>commandLineArgs(paramDefinitions);
  } catch {
    showHelp = true;
  }

  if (showHelp || params!.help) {
    const usage = commandLineUsage([
      {
        content: 'Publishes the current contents of "dist" to NPM.',
      },
      {
        header: 'Options',
        optionList: paramDefinitions,
      },
      {
        header: 'Examples',
        content: [
          {
            desc: 'Publish a canary beta',
            example: '$ scripts/release/publish.js --canary --preid beta',
          },
          {
            desc: 'Publish a new stable:',
            example: '$ scripts/release/publish.js',
          },
        ],
      },
    ]);

    console.log(usage);
    process.exit(1);
  }

  return params!;
};

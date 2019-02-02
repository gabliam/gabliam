import * as inquirer from 'inquirer';

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  { [K in Keys]-?: Required<Pick<T, K>> }[Keys];

export const select = async <T = any>(
  message: string,
  {
    choices,
    validate,
    filter,
  }: RequireOnlyOne<
    Pick<inquirer.Question, 'choices' | 'validate' | 'filter'>,
    'choices'
  >
): Promise<T> => {
  const { prompt } = await inquirer.prompt<{ prompt: T }>([
    {
      type: 'list',
      name: 'prompt',
      message,
      choices,
      pageSize: choices.length,
      filter,
      validate,
    },
  ]);
  return prompt;
};

export const input = async <T = any>(
  message: string,
  { validate, filter }: Pick<inquirer.Question, 'validate' | 'filter'> = {}
): Promise<T> => {
  const { prompt } = await inquirer.prompt<{ prompt: T }>([
    {
      type: 'input',
      name: 'prompt',
      message,
      filter,
      validate,
    },
  ]);
  return prompt;
};

export const confirm = async (message: string) => {
  const { prompt } = await inquirer.prompt<{ prompt: boolean }>([
    {
      type: 'expand',
      name: 'prompt',
      message,
      default: 2, // default to help in order to avoid clicking straight through
      choices: [
        { key: 'y', name: 'Yes', value: true },
        { key: 'n', name: 'No', value: false },
      ],
    },
  ]);
  return prompt;
};

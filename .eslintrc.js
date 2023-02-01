module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  root: true,
  env: {
    node: true,
  },
  rules: {
    'import/no-cycle': ['error', { maxDepth: 1, ignoreExternal: true }],
    'prefer-destructuring': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    '@typescript-eslint/no-redeclare': [
      'error',
      { ignoreDeclarationMerge: true },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      // Allow camelCase variables (23.2), PascalCase variables (23.8), and UPPER_CASE variables (23.10)
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      // Allow camelCase functions (23.2), and PascalCase functions (23.8)
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
    ]
  },
  overrides: [
    {
      env: {
        jest: true,
        'jest/globals': true,
      },
      files: 'packages/**/__tests__/**/*.ts',
      plugins: ['jest'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-extraneous-dependencies': 'off',
        'max-classes-per-file': 'off',
        'class-methods-use-this': 'off',
        'no-useless-return': 'off',
        'prefer-arrow-callback': 'off',
        'func-names': 'off',
        'no-new': 'off',
        'no-param-reassign': 'off',
        'no-return-assign': 'off',
        'no-console': 'off',
        'no-empty': 'off',
      },
    },
  ],
};

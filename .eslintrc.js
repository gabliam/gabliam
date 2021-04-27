module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { "args": "none"}],

  },
  overrides: [
    {
      env: {
        jest: true,
        "jest/globals": true
      },
      files: 'packages/**/__tests__/**/*.ts',
      plugins: ["jest"],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ]
};

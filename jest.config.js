// jest.config.js
module.exports = {
  "transform": {
    ".(ts|tsx)": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  "collectCoverageFrom": [
    "packages/**/src/**/*.{ts}",
    "!packages/**/src/interfaces/**",
    "!packages/**/src/testing/**",
    "!packages/**/src/typings/**",
    "!packages/graphql-core/src/graphql-core-plugin.ts",
    "!packages/expression/src/**/*.ts",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  "moduleNameMapper": {
    "@gabliam/(.*)/lib/(.*)": "<rootDir>/packages/$1/src/$2",
    "@gabliam/(.*)": "<rootDir>/packages/$1/src/index.ts"
  },
  "setupTestFrameworkScriptFile": "<rootDir>/tests/setup.js",
  "testEnvironment": "node",
  "testRegex": "(/__tests__/.*)\\.test\\.(ts|tsx|js)$",
  "snapshotSerializers": [
    "jest-serializer-path",
    "jest-serializer-supertest"
  ],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "json"
  ]
};

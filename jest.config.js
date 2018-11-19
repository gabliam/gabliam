// jest.config.js
module.exports = {
  "transform": {
    ".(ts|tsx)": "ts-jest"
  },
  "collectCoverageFrom": [
    "packages/**/src/**/*.ts",
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
  "setupTestFrameworkScriptFile": "<rootDir>/tests/setup.ts",
  "testEnvironment": "node",
  "testRegex": "(/__tests__/.*)\\.test\\.(ts|tsx|js)$",
  "testPathIgnorePatterns": [
    "packages/graphql-express",
    "packages/graphql-koa"
  ],
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

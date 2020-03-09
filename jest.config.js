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
    "!packages/core/expression/src/**/*.ts",
    "!packages/database/typeorm/src/commands/**/*.ts",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  "moduleNameMapper": {
    "@gabliam/core/src/(.*)": "<rootDir>/packages/core/core/src/$1",
    "@gabliam/web-core/src/(.*)": "<rootDir>/packages/web/web-core/src/$1",
    "@gabliam/amqp": "<rootDir>/packages/broker/amqp/src/index.ts",
    "@gabliam/cache": "<rootDir>/packages/cache/cache/src/index.ts",
    "@gabliam/cache-redis": "<rootDir>/packages/cache/cache-redis/src/index.ts",
    "@gabliam/core": "<rootDir>/packages/core/core/src/index.ts",
    "@gabliam/expression": "<rootDir>/packages/core/expression/src/index.ts",
    "@gabliam/mongoose": "<rootDir>/packages/database/mongoose/src/index.ts",
    "@gabliam/typeorm": "<rootDir>/packages/database/typeorm/src/index.ts",
    "@gabliam/log4js": "<rootDir>/packages/tools/log4js/src/index.ts",
    "@gabliam/express": "<rootDir>/packages/web/express/src/index.ts",
    "@gabliam/graphql-core": "<rootDir>/packages/web/graphql-core/src/index.ts",
    "@gabliam/graphql-express": "<rootDir>/packages/web/graphql-express/src/index.ts",
    "@gabliam/graphql-koa": "<rootDir>/packages/web/graphql-koa/src/index.ts",
    "@gabliam/koa": "<rootDir>/packages/web/koa/src/index.ts",
    "@gabliam/web-core": "<rootDir>/packages/web/web-core/src/index.ts",
  },
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"],
  "testEnvironment": "node",
  "testRegex": "(/__tests__/.*)\\.test\\.(ts|tsx|js)$",
  "snapshotSerializers": [
    "jest-serializer-path",
    "jest-serializer-supertest"
  ],
  "modulePathIgnorePatterns": [
    "<rootDir>/dist/"
  ],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "json"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/"
  ]
};

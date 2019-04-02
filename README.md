<h3 align="center">
  Gabliam
</h3>

<p align="center">
  Nodejs Framework
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gabliam/core"><img src="https://img.shields.io/npm/v/@gabliam/core.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@gabliam/core"><img src="https://img.shields.io/npm/dm/@gabliam/core.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/gabliam/gabliam"><img src="https://img.shields.io/travis/gabliam/gabliam/master.svg?style=flat-square"></a>
  <a href="https://coveralls.io/github/gabliam/gabliam?branch=master"><img src="https://img.shields.io/coveralls/github/gabliam/gabliam.svg?style=flat-square"></a>
</p>


## Packages

This repository is a monorepo that we manage using [Lerna](https://github.com/lerna/lerna). That means that we actually publish [several packages](/packages) to npm from the same codebase, including:

#### Core

| Package | Version | Docs | Description |
|---------|---------|------|-------------|
| [`core`](/packages/core/core) | [![npm](https://img.shields.io/npm/v/@gabliam/core.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/core) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/core/core/#readme) | The core of Gabliam |
| [`expression`](/packages/core/expression) | [![npm](https://img.shields.io/npm/v/@gabliam/expression.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/expression) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/core/expression/#readme) | The expression parser for gabliam |


#### Broker

| Package | Version | Docs | Description |
|---------|---------|------|-------------|
| [`amqp`](/packages/broker/amqp) | [![npm](https://img.shields.io/npm/v/@gabliam/amqp.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/amqp) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/broker/amqp/#readme) | The amqp plugin for Gabliam |

#### Cache

| Package | Version | Docs | Description |
|---------|---------|------|-------------|
| [`cache`](/packages/cache/cache) | [![npm](https://img.shields.io/npm/v/@gabliam/cache.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/cache) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/cache/cache/#readme) | Cache for Gabliam |
| [`cache-redis`](/packages/cache/cache-redis) | [![npm](https://img.shields.io/npm/v/@gabliam/cache-redis.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/cache-redis) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/cache/cache-redis/#readme) | Redis cache for Gabliam |

#### Database

| Package | Version | Docs | Description |
|---------|---------|------|-------------|
| [`mongoose`](/packages/database/mongoose) | [![npm](https://img.shields.io/npm/v/@gabliam/mongoose.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/mongoose) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/database/mongoose/#readme) | The mongoose plugin for Gabliam |
| [`typeorm`](/packages/typeorm) | [![npm](https://img.shields.io/npm/v/@gabliam/typeorm.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/typeorm) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/typeorm/#readme) | The typeorm plugin for Gabliam |

#### Tools

| Package | Version | Docs | Description |
|---------|---------|------|-------------|
| [`log4js`](/packages/tools/log4js) | [![npm](https://img.shields.io/npm/v/@gabliam/log4js.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/log4js) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/tools/log4js/#readme) | The log4js plugin for Gabliam |

#### Web

| Package | Version | Docs | Description |
|---------|---------|------|-------------|
| [`express`](/packages/web/express) | [![npm](https://img.shields.io/npm/v/@gabliam/express.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/express) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/express/#readme) | The express plugin for Gabliam |
| [`graphql-core`](/packages/web/graphql-core) | [![npm](https://img.shields.io/npm/v/@gabliam/graphql-core.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/graphql-core) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/graphql-core/#readme) | The graphql core for Gabliam |
| [`graphql-express`](/packages/web/graphql-express) | [![npm](https://img.shields.io/npm/v/@gabliam/graphql-express.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/graphql-express) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/graphql-express/#readme) | The graphql plugin for Gabliam with express |
| [`graphql-koa`](/packages/web/graphql-koa) | [![npm](https://img.shields.io/npm/v/@gabliam/graphql-koa.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/graphql-koa) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/graphql-koa/#readme) | The graphql plugin for Gabliam with koa |
| [`koa`](/packages/web/koa) | [![npm](https://img.shields.io/npm/v/@gabliam/koa.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/koa) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/koa/#readme) | The koa plugin for Gabliam |
| [`web-core`](/packages/web/web-core) | [![npm](https://img.shields.io/npm/v/@gabliam/web-core.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/web-core) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/web-core/#readme) | The web core for Gabliam (contains all decorator and tools) |
| [`validate-joi`](/packages/web/validate-joi) | [![npm](https://img.shields.io/npm/v/@gabliam/validate-joi.svg?style=flat-square)](https://www.npmjs.com/package/@gabliam/validate-joi) | [![](https://img.shields.io/badge/API%20Docs-readme-orange.svg?style=flat-square)](/packages/web/validate-joi/#readme) | Add validation with joi of params |

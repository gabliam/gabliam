<a name="7.9.4"></a>
## [7.9.4](https://github.com/gabliam/gabliam/compare/v7.9.3...v7.9.4) (2018-06-19)


### Bug Fixes

* **@gabliam/core:** add test if bean is defined and it's an instance ([1e8daad](https://github.com/gabliam/gabliam/commit/1e8daad))


### Features

* **@gabliam/core:** add preDestroy decorator ([ab0587b](https://github.com/gabliam/gabliam/commit/ab0587b))



<a name="7.9.3"></a>
## [7.9.3](https://github.com/gabliam/gabliam/compare/v7.9.2...v7.9.3) (2018-06-05)


### Bug Fixes

* **@gabliam/core:** delete error when decorate multiple times a class (for inheritance) ([594e668](https://github.com/gabliam/gabliam/commit/594e668))



<a name="7.9.2"></a>
## [7.9.2](https://github.com/gabliam/gabliam/compare/v7.9.1...v7.9.2) (2018-06-03)


### Bug Fixes

* **@gabliam/expression:** Correction for LogicalExpression ([dcf16f4](https://github.com/gabliam/gabliam/commit/dcf16f4))



<a name="7.9.1"></a>
## [7.9.1](https://github.com/gabliam/gabliam/compare/v7.9.0...v7.9.1) (2018-06-01)


### Bug Fixes

* **@gabliam/cache:** remove test if method is async ([d537d81](https://github.com/gabliam/gabliam/commit/d537d81))



<a name="7.9.0"></a>
# [7.9.0](https://github.com/gabliam/gabliam/compare/v7.8.3...v7.9.0) (2018-06-01)


### Features

* **@gabliam/core:** Plugin deps can be a plugin which is auto loaded by gabliam ([6240aeb](https://github.com/gabliam/gabliam/commit/6240aeb))



<a name="7.8.3"></a>
## [7.8.3](https://github.com/gabliam/gabliam/compare/v7.8.2...v7.8.3) (2018-06-01)


### Bug Fixes

* **@gabliam/cache-redis:** Use redis exist for test if value is in cache ([2a4bf7a](https://github.com/gabliam/gabliam/commit/2a4bf7a))



<a name="7.8.2"></a>
## [7.8.2](https://github.com/gabliam/gabliam/compare/v7.8.1...v7.8.2) (2018-05-31)


### Bug Fixes

* **@gabliam/expression:** Correction for expressions which use global var (ex: Array.isArray) ([d080ed5](https://github.com/gabliam/gabliam/commit/d080ed5))



<a name="7.8.1"></a>
## [7.8.1](https://github.com/gabliam/gabliam/compare/v7.8.0...v7.8.1) (2018-05-28)


### Bug Fixes

* **@gabliam/cache:** correction export decorators ([72ae45c](https://github.com/gabliam/gabliam/commit/72ae45c))



<a name="7.8.0"></a>
# [7.8.0](https://github.com/gabliam/gabliam/compare/v7.7.2...v7.8.0) (2018-05-28)


### Features

* **@gabliam/cache:** Add cache plugin for autoconfiguration of cache ([659f97f](https://github.com/gabliam/gabliam/commit/659f97f))



<a name="7.7.2"></a>
## [7.7.2](https://github.com/gabliam/gabliam/compare/v7.7.1...v7.7.2) (2018-05-22)


### Features

* **@gabliam/cache:** Add unless for @Cacheable, @CachePut and @CacheEvict ([48cf0ef](https://github.com/gabliam/gabliam/commit/48cf0ef))
* **@gabliam/cache-redis:** replace node_redis by ioredis ([19c5018](https://github.com/gabliam/gabliam/commit/19c5018))



<a name="7.7.1"></a>
## [7.7.1](https://github.com/gabliam/gabliam/compare/v7.7.0...v7.7.1) (2018-05-21)


### Bug Fixes

* **@gabliam/express @gabliam/koa:** Correction for all parameters when they receive 0 ([cad3344](https://github.com/gabliam/gabliam/commit/cad3344))



<a name="7.7.0"></a>
# [7.7.0](https://github.com/gabliam/gabliam/compare/v7.6.2...v7.7.0) (2018-05-18)


### Features

* **@gabliam/express @gabliam/web-core:** add ValidatorOptions for @Validate ([fef77ac](https://github.com/gabliam/gabliam/commit/fef77ac))



<a name="7.6.2"></a>
## [7.6.2](https://github.com/gabliam/gabliam/compare/v7.6.1...v7.6.2) (2018-05-09)


### Bug Fixes

* **@gabliam/amqp:** correction when no queues ([e2ed25a](https://github.com/gabliam/gabliam/commit/e2ed25a))


### Features

* **@gabliam/web-core & @gabliam/express:** Add validate decorator ([163da30](https://github.com/gabliam/gabliam/commit/163da30))



<a name="7.6.1"></a>
## [7.6.1](https://github.com/gabliam/gabliam/compare/v7.6.0...v7.6.1) (2018-04-16)


### Features

* **@gabliam/core:** add plugins method ([c989995](https://github.com/gabliam/gabliam/commit/c989995))



<a name="7.6.0"></a>
# [7.6.0](https://github.com/gabliam/gabliam/compare/v7.5.0...v7.6.0) (2018-04-05)


### Features

* rename rest-decorators to web-core ([6c5f792](https://github.com/gabliam/gabliam/commit/6c5f792))
* update deps ([3f6a865](https://github.com/gabliam/gabliam/commit/3f6a865))
* **@gabliam/amqp:** add multiple connection for amqp ([86101e2](https://github.com/gabliam/gabliam/commit/86101e2))
* **@gabliam/express:** delete useless code ([1099192](https://github.com/gabliam/gabliam/commit/1099192))
* **@gabliam/express:** Integration of rest-decorators ([9573ac7](https://github.com/gabliam/gabliam/commit/9573ac7))
* **@gabliam/koa:** Integration of rest-decorators ([1adc653](https://github.com/gabliam/gabliam/commit/1adc653))
* **@gabliam/rest-decorators:** begin rest-decorators module ([396f61b](https://github.com/gabliam/gabliam/commit/396f61b))



<a name="7.5.0"></a>
# [7.5.0](https://github.com/gabliam/gabliam/compare/v7.4.0...v7.5.0) (2018-03-09)


### Features

* Update all deps + upgrade to ts 2.7.2 ([01ce131](https://github.com/gabliam/gabliam/commit/01ce131))



<a name="7.4.0"></a>
# [7.4.0](https://github.com/gabliam/gabliam/compare/v7.3.3...v7.4.0) (2018-03-08)


### Features

* **@gabliam/core:** Base path for LoaderConfig and resolvers use the config path now ([dfd64da](https://github.com/gabliam/gabliam/commit/dfd64da))
* **@gabliam/core:** loader config no longer use the resolver. All Loader must use resolver ([570d811](https://github.com/gabliam/gabliam/commit/570d811))
* **@gabliam/core:** scanPath is not mandatory for Gabliam ([5801c1c](https://github.com/gabliam/gabliam/commit/5801c1c))



<a name="7.3.3"></a>
## [7.3.3](https://github.com/gabliam/gabliam/compare/v7.3.2...v7.3.3) (2018-02-27)


### Bug Fixes

* **@gabliam/express:** fix all param decorator ([5e5ba53](https://github.com/gabliam/gabliam/commit/5e5ba53))
* **@gabliam/koa:** fix all param decorator ([47bd05e](https://github.com/gabliam/gabliam/commit/47bd05e))



<a name="7.3.2"></a>
## [7.3.2](https://github.com/gabliam/gabliam/compare/v7.3.1...v7.3.2) (2018-01-30)


### Bug Fixes

* **@gabliam/typeorm:** ConnectionManager.close close all connections (missing () 😅 ) ([0b7ae42](https://github.com/gabliam/gabliam/commit/0b7ae42))



<a name="7.3.1"></a>
## [7.3.1](https://github.com/gabliam/gabliam/compare/v7.3.0...v7.3.1) (2018-01-24)


### Bug Fixes

* **@gabliam/mongoose:** change error message ([589c61d](https://github.com/gabliam/gabliam/commit/589c61d))
* **@gabliam/typeorm:** set defaultContainer.instances to [] when typeorm plugin is destroyed ([d180498](https://github.com/gabliam/gabliam/commit/d180498))



<a name="7.3.0"></a>
# [7.3.0](https://github.com/gabliam/gabliam/compare/v7.2.0...v7.3.0) (2018-01-18)


### Bug Fixes

* **@gabliam/core:** change middleware by activation hook. ([aba9fbe](https://github.com/gabliam/gabliam/commit/aba9fbe))
* **@gabliam/mongoose:** Prevent to throw error if default cunit doesn't exist ([f9830f9](https://github.com/gabliam/gabliam/commit/f9830f9))
* **@gabliam/typeorm:** Prevent to throw error if default cunit doesn't exist ([4fab3f1](https://github.com/gabliam/gabliam/commit/4fab3f1))


### Features

* update deps ([c1c8ea6](https://github.com/gabliam/gabliam/commit/c1c8ea6))



<a name="7.2.0"></a>
# [7.2.0](https://github.com/gabliam/gabliam/compare/v7.1.1...v7.2.0) (2018-01-02)


### Bug Fixes

* **@gabliam/amqp:** correction for getQueueName ([fd2d3d6](https://github.com/gabliam/gabliam/commit/fd2d3d6))


### Features

* **@gabliam/core:** add @BeforeCreate decorator ([9464367](https://github.com/gabliam/gabliam/commit/9464367))
* **@gabliam/mongoose:** add multiple connection ([36fc101](https://github.com/gabliam/gabliam/commit/36fc101))
* **@gabliam/typeorm:** add multiple connection ([687c607](https://github.com/gabliam/gabliam/commit/687c607))



<a name="7.1.1"></a>
## [7.1.1](https://github.com/gabliam/gabliam/compare/v7.1.0...v7.1.1) (2017-12-18)


### Bug Fixes

* **@gabliam/expression:** delete peerDeps for [@gabliam](https://github.com/gabliam)/expression ([413f46a](https://github.com/gabliam/gabliam/commit/413f46a))



<a name="7.1.0"></a>
# [7.1.0](https://github.com/gabliam/gabliam/compare/v7.0.0...v7.1.0) (2017-12-14)


### Features

* **@gabliam/cache:** add redis cache ([7be54d7](https://github.com/gabliam/gabliam/commit/7be54d7))



<a name="7.0.0"></a>
# [7.0.0](https://github.com/gabliam/gabliam/compare/v6.3.0...v7.0.0) (2017-12-07)


### Features

* add engines node >= 8.9.0 ([3e1a7f0](https://github.com/gabliam/gabliam/commit/3e1a7f0))
* **@gabliam/*:** build target es2015 to es2017 ([971e882](https://github.com/gabliam/gabliam/commit/971e882))



<a name="6.3.0"></a>
# [6.3.0](https://github.com/gabliam/gabliam/compare/v6.2.4...v6.3.0) (2017-12-03)


### Features

* **@gabliam/express:** @Controller and @RestController now use valueExtractor ([8a4102c](https://github.com/gabliam/gabliam/commit/8a4102c))
* **@gabliam/koa:** @Controller and @RestController now use valueExtractor ([33b150f](https://github.com/gabliam/gabliam/commit/33b150f))



<a name="6.2.4"></a>
## [6.2.4](https://github.com/gabliam/gabliam/compare/v6.2.3...v6.2.4) (2017-11-30)


### Bug Fixes

* **@gabliam/core:** prevent the multiple add of the same value in the registry ([0706cfe](https://github.com/gabliam/gabliam/commit/0706cfe))



<a name="6.2.3"></a>
## [6.2.3](https://github.com/gabliam/gabliam/compare/v6.2.2...v6.2.3) (2017-11-29)


### Bug Fixes

* **@gabliam/core:** fix path ([e69b0fa](https://github.com/gabliam/gabliam/commit/e69b0fa))



<a name="6.2.2"></a>
## [6.2.2](https://github.com/gabliam/gabliam/compare/v6.2.1...v6.2.2) (2017-11-29)


### Bug Fixes

* **@gabliam/core loader-config:** require default when loader is a string ([d41ac1f](https://github.com/gabliam/gabliam/commit/d41ac1f))



<a name="6.2.1"></a>
## [6.2.1](https://github.com/gabliam/gabliam/compare/v6.2.0...v6.2.1) (2017-11-29)


### Bug Fixes

* **@gabliam/expression:** correction import bson ([c574406](https://github.com/gabliam/gabliam/commit/c574406))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/gabliam/gabliam/compare/v6.1.0...v6.2.0) (2017-11-28)


### Features

* add tslib and add importHelpers ([e8b790c](https://github.com/gabliam/gabliam/commit/e8b790c))
* **@gabliam/cache:** add @Cacheable decorator ([162556d](https://github.com/gabliam/gabliam/commit/162556d))
* **@gabliam/cache:** add @CacheEvict ([2672a4c](https://github.com/gabliam/gabliam/commit/2672a4c))
* **@gabliam/cache:** add cachePut + tests ([4ef5569](https://github.com/gabliam/gabliam/commit/4ef5569))
* **@gabliam/cache:** add condition in Cacheable ([396917f](https://github.com/gabliam/gabliam/commit/396917f))
* **@gabliam/cache:** init cache plugin ([a6eccff](https://github.com/gabliam/gabliam/commit/a6eccff))
* **@gabliam/cache:** refactor for best performance ([9983c00](https://github.com/gabliam/gabliam/commit/9983c00))
* **@gabliam/core:** @OnMissingBean decorator for creation of bean when another is missing ([665d4b8](https://github.com/gabliam/gabliam/commit/665d4b8))
* **@gabliam/core:** bind ExpressParser with config ([356efa1](https://github.com/gabliam/gabliam/commit/356efa1))
* **@gabliam/core:** use expression parser for [@value](https://github.com/value) ([208f496](https://github.com/gabliam/gabliam/commit/208f496))
* **@gabliam/expression:** begin expression package ([003c93b](https://github.com/gabliam/gabliam/commit/003c93b))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/gabliam/gabliam/compare/v6.0.1...v6.1.0) (2017-11-17)


### Bug Fixes

* **@gabliam/graphql-express:** remove lodash dependencies ([657e69e](https://github.com/gabliam/gabliam/commit/657e69e))


### Features

* **@gabliam/core:** Add InjectContainer ([2bce53e](https://github.com/gabliam/gabliam/commit/2bce53e))
* **@gabliam/graphql-core:** now export TYPE from constants ([993e3d2](https://github.com/gabliam/gabliam/commit/993e3d2))
* **@gabliam/graphql-express:** remove constant file ([d25138f](https://github.com/gabliam/gabliam/commit/d25138f))
* **@gabliam/graphql-koa:** add graphql with koa ([112e325](https://github.com/gabliam/gabliam/commit/112e325))



<a name="6.0.1"></a>
## [6.0.1](https://github.com/gabliam/gabliam/compare/v6.0.0...v6.0.1) (2017-11-15)


### Features

* **graphql*:** add [@types](https://github.com/types)/graphql ([a0b97f7](https://github.com/gabliam/gabliam/commit/a0b97f7))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/gabliam/gabliam/compare/v5.1.0...v6.0.0) (2017-11-15)


### Bug Fixes

* **@gabliam/express:** correction import path ([584f9db](https://github.com/gabliam/gabliam/commit/584f9db))
* **@gabliam/koa:** correction import path ([2c65a2e](https://github.com/gabliam/gabliam/commit/2c65a2e))


### Features

* update deps ([f8bc5c3](https://github.com/gabliam/gabliam/commit/f8bc5c3))
* **@gabliam/core:** add config for config-loader ([a38fe7f](https://github.com/gabliam/gabliam/commit/a38fe7f))
* **@gabliam/graphql:** graphiql options endpointURL can be overrided ([3ba027c](https://github.com/gabliam/gabliam/commit/3ba027c))
* **@gabliam/graphql:** rename [@gabliam](https://github.com/gabliam)/graphql to [@gabliam](https://github.com/gabliam)/graphql-express ([2cd981f](https://github.com/gabliam/gabliam/commit/2cd981f))
* **@gabliam/graphql:** split graphql ([d9b51a7](https://github.com/gabliam/gabliam/commit/d9b51a7))
* **@gabliam/log4js:** config change ([1cee9e9](https://github.com/gabliam/gabliam/commit/1cee9e9))



<a name="5.1.0"></a>
# [5.1.0](https://github.com/gabliam/gabliam/compare/v5.0.0...v5.1.0) (2017-11-07)


### Bug Fixes

* **@gabliam/koa:** correction for headers in response-entity ([4d1828f](https://github.com/gabliam/gabliam/commit/4d1828f))
* **@gabliam/koa:** delete prefix if path is / in router root ([39c910f](https://github.com/gabliam/gabliam/commit/39c910f))


### Features

* **@gabliam/koa:** begin koa plugin ([eaf244e](https://github.com/gabliam/gabliam/commit/eaf244e))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/gabliam/gabliam/compare/v4.0.0...v5.0.0) (2017-11-03)


### Bug Fixes

* correction when [@types](https://github.com/types)/lodash was upgraded ([9ab16c6](https://github.com/gabliam/gabliam/commit/9ab16c6))


### Features

* upgrade deps. Correction for ts update ([274e238](https://github.com/gabliam/gabliam/commit/274e238))
* **@gabliam/typeorm:** update typeorm : 0.0.8 to 0.1.1 ([552d9f1](https://github.com/gabliam/gabliam/commit/552d9f1))
* **@gabliam/typeorm:** upgrade typeorm deps ([4b0d498](https://github.com/gabliam/gabliam/commit/4b0d498))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/gabliam/gabliam/compare/v4.0.0-2...v4.0.0) (2017-10-25)


### Bug Fixes

* **yarn:** fix yarn version ([ef1de36](https://github.com/gabliam/gabliam/commit/ef1de36))
* correction preinstall ([f11224f](https://github.com/gabliam/gabliam/commit/f11224f))


### Features

* core export joi ([5a79aca](https://github.com/gabliam/gabliam/commit/5a79aca))
* update snapshots ([743af34](https://github.com/gabliam/gabliam/commit/743af34))
* **@gabliam/core:** now all interfaces are exported ([511df0e](https://github.com/gabliam/gabliam/commit/511df0e))
* **@gabliam/express:** express is exported by gabliam/express ([a4a224a](https://github.com/gabliam/gabliam/commit/a4a224a))
* **@gabliam/graphql:** add GraphQLMapFieldResolver interface ([3b4f267](https://github.com/gabliam/gabliam/commit/3b4f267))
* **@gabliam/mongoose:** mongoose is exported ([87ddda8](https://github.com/gabliam/gabliam/commit/87ddda8))



<a name="4.0.0-2"></a>
# [4.0.0-2](https://github.com/gabliam/gabliam/compare/v4.0.0-1...v4.0.0-2) (2017-10-05)


### Bug Fixes

* correction deps ([0b521ac](https://github.com/gabliam/gabliam/commit/0b521ac))



<a name="4.0.0-1"></a>
# [4.0.0-1](https://github.com/gabliam/gabliam/compare/v4.0.0-0...v4.0.0-1) (2017-10-05)


### Bug Fixes

* **amqp-connection:** add autoDelete to true for sendAndReceive ([50651ad](https://github.com/gabliam/gabliam/commit/50651ad))
* **decorators:** fix typo RabbitComsumer => RabbitConsumer ([db67e1d](https://github.com/gabliam/gabliam/commit/db67e1d))
* **log4js config:** add fs.exist for loggerConfigPath ([6703d3a](https://github.com/gabliam/gabliam/commit/6703d3a))
* add publishrc ([f5a7d31](https://github.com/gabliam/gabliam/commit/f5a7d31))
* correction peerDependencies ([df0420a](https://github.com/gabliam/gabliam/commit/df0420a))
* correction peerDependencies ([e650065](https://github.com/gabliam/gabliam/commit/e650065))
* fix multiple query ([a4e863b](https://github.com/gabliam/gabliam/commit/a4e863b))
* fix peerDependencies ([1e876c9](https://github.com/gabliam/gabliam/commit/1e876c9))
* SendAndReceive: Ack all the time even if there is a timeout error ([d84da0f](https://github.com/gabliam/gabliam/commit/d84da0f))


### Features

* **all:** all entities are auto register ([1aff6c0](https://github.com/gabliam/gabliam/commit/1aff6c0))
* upgrade [@gabliam](https://github.com/gabliam)/core to v3 ([366dbd7](https://github.com/gabliam/gabliam/commit/366dbd7))
* **all:** First version ([1efd944](https://github.com/gabliam/gabliam/commit/1efd944))
* **all:** First version ([a833dc7](https://github.com/gabliam/gabliam/commit/a833dc7))
* add debug ([05bf917](https://github.com/gabliam/gabliam/commit/05bf917))
* Change CamelCase for KebabCase ([91c89a8](https://github.com/gabliam/gabliam/commit/91c89a8))
* Change loading graphql file ([03e0ed5](https://github.com/gabliam/gabliam/commit/03e0ed5))
* now we can disabled graphiql ([bc71985](https://github.com/gabliam/gabliam/commit/bc71985))
* sendToQueue, sendAndReceive create buffer ([646e508](https://github.com/gabliam/gabliam/commit/646e508))
* upgrade [@gabliam](https://github.com/gabliam)/core to v3 ([c2c26e0](https://github.com/gabliam/gabliam/commit/c2c26e0))
* upgrade deps ([b3cdeb7](https://github.com/gabliam/gabliam/commit/b3cdeb7))
* **AmqpConnection:** add default timeout for sendAndReceive ([3dbcfa3](https://github.com/gabliam/gabliam/commit/3dbcfa3))
* upgrade gabliam/core to 3.X.X ([31b9dd8](https://github.com/gabliam/gabliam/commit/31b9dd8))
* **AmqpConnection:** sendAndReceive can take a timeout ([5a9a96e](https://github.com/gabliam/gabliam/commit/5a9a96e))
* **consume queue:** JSON.parse for content in consume queue ([e0cda93](https://github.com/gabliam/gabliam/commit/e0cda93))
* **decorators:** Add relative path and pwd ([d2c8915](https://github.com/gabliam/gabliam/commit/d2c8915))
* **log4js:** upgrade log4js v1 to v2 ([839babc](https://github.com/gabliam/gabliam/commit/839babc))
* **MongooseConnection:** getRepository return repository or throw error ([439ddb7](https://github.com/gabliam/gabliam/commit/439ddb7))
* **package:** add publishConfig ([15601a8](https://github.com/gabliam/gabliam/commit/15601a8))
* **schema:** delete default value in schemaQueueOptions ([165b9b1](https://github.com/gabliam/gabliam/commit/165b9b1))
* upgrade to gabliam v3 ([06ff7e7](https://github.com/gabliam/gabliam/commit/06ff7e7))
* upgrade to gabliam v3 ([49237a1](https://github.com/gabliam/gabliam/commit/49237a1))


### BREAKING CHANGES

* incompatible with gabliam v2



<a name="4.0.0-0"></a>
# [4.0.0-0](https://github.com/gabliam/gabliam/compare/c2abf27...v4.0.0-0) (2017-10-03)


### Bug Fixes

* **@ExpressConfig,@ExpressErrorConfig:** throw error when decorated multiple times the same method w ([e203e37](https://github.com/gabliam/gabliam/commit/e203e37))
* **@Restcontroller,@Controller:** fix @Restcontroller and @Controller ([e0238fa](https://github.com/gabliam/gabliam/commit/e0238fa))
* **all methods:** Add / on path ([5d3880d](https://github.com/gabliam/gabliam/commit/5d3880d))
* **config:** Correction when application.yml is empty ([8d64808](https://github.com/gabliam/gabliam/commit/8d64808))
* **ExpressConfig:** Correction ([3596456](https://github.com/gabliam/gabliam/commit/3596456))
* **gabliam:** correction process.env() to process.env.PWD ([c2abf27](https://github.com/gabliam/gabliam/commit/c2abf27))
* **hadlerFactory:** Correction when controller return void ([c713054](https://github.com/gabliam/gabliam/commit/c713054))
* **handlerFactory:** revert Correction when controller return void ([af028fa](https://github.com/gabliam/gabliam/commit/af028fa))
* **loader:** fix loader module and add test ([206c20f](https://github.com/gabliam/gabliam/commit/206c20f))
* **order plugin load:** Correction for plugin order ([fe4a954](https://github.com/gabliam/gabliam/commit/fe4a954))
* **package:** correction peerDependencies ([9071d70](https://github.com/gabliam/gabliam/commit/9071d70))
* **RestPluginConfig:** parseInt process.env.port if exist ([c73ebd1](https://github.com/gabliam/gabliam/commit/c73ebd1))
* **utils:** fix tslint error Shadowed name: 'validate' ([e241659](https://github.com/gabliam/gabliam/commit/e241659))
* **yarn:** fix repository ([82ea83a](https://github.com/gabliam/gabliam/commit/82ea83a))


### Features

* **@Config,@Service,@register:** add error when decorated multiple times ([15f6bc7](https://github.com/gabliam/gabliam/commit/15f6bc7))
* **@QueryParam:** If the query waits for a Number, we try to convert the value ([bab676f](https://github.com/gabliam/gabliam/commit/bab676f))
* **@RequestParam:** If the param waits for a Number, we try to convert the value ([7e0f65b](https://github.com/gabliam/gabliam/commit/7e0f65b))
* **@scan:** [@scan](https://github.com/scan) ([69c514d](https://github.com/gabliam/gabliam/commit/69c514d))
* **config:** now config use shortstop ([e41968c](https://github.com/gabliam/gabliam/commit/e41968c))
* **controller, methods:** Now you can inject middleware in @Controller, @RestController, and all me ([e07638b](https://github.com/gabliam/gabliam/commit/e07638b))
* **decorators:** add many decorators ([3ee2abd](https://github.com/gabliam/gabliam/commit/3ee2abd))
* **decorators:** delete utils ([8d16921](https://github.com/gabliam/gabliam/commit/8d16921))
* **ExpressConfig,ExpressErrorConfig:** Add order ([4d28d3d](https://github.com/gabliam/gabliam/commit/4d28d3d))
* **gabliam:** add VALUE_EXTRACTOR in di ([097fa90](https://github.com/gabliam/gabliam/commit/097fa90))
* **gabliam:** change plugin ([d03a1fc](https://github.com/gabliam/gabliam/commit/d03a1fc))
* **gabliam:** loader is public (for test) ([6b91f37](https://github.com/gabliam/gabliam/commit/6b91f37))
* **gabliam:** plugins and options are public (for test) ([22904e2](https://github.com/gabliam/gabliam/commit/22904e2))
* **Gabliam:** change registry ([3d94907](https://github.com/gabliam/gabliam/commit/3d94907))
* **Gabliam:** delete interfaces GabliamOptions and use Partial<GabliamConfig> ([6051ed5](https://github.com/gabliam/gabliam/commit/6051ed5))
* **gabliam test:** add startPlugins ([73fc7d5](https://github.com/gabliam/gabliam/commit/73fc7d5))
* **GabliamTest:** rename start to build ([4fd571b](https://github.com/gabliam/gabliam/commit/4fd571b))
* **loader:** split module and config loader ([6c1ed1d](https://github.com/gabliam/gabliam/commit/6c1ed1d))
* **plugin:** add @Plugin decorator ([b91c306](https://github.com/gabliam/gabliam/commit/b91c306))
* **plugin:** add MiddlewareConfig ([9ec01d8](https://github.com/gabliam/gabliam/commit/9ec01d8))
* **plugin:** add router creator + correction tslint ([b3130cb](https://github.com/gabliam/gabliam/commit/b3130cb))
* **registry:** rewrite registry ([6c65aa7](https://github.com/gabliam/gabliam/commit/6c65aa7))
* **value:** Add valueExtractor in utils ([ae003ce](https://github.com/gabliam/gabliam/commit/ae003ce))
* Add ResponseEntity ([45d9c47](https://github.com/gabliam/gabliam/commit/45d9c47))
* rewrite sort plugin ([fb8ecd6](https://github.com/gabliam/gabliam/commit/fb8ecd6))
* upgrade gabliam/core to 3.X.X ([216e372](https://github.com/gabliam/gabliam/commit/216e372))
* **valueExtractor:** valueExtractor take inversify interface container ([fbc292d](https://github.com/gabliam/gabliam/commit/fbc292d))


### BREAKING CHANGES

* **plugin:** Plugins must be decorated by @Plugin
* **registry:** plugins who depends to gabliam/core 2.X.X




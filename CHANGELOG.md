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
* **@Restcontroller,@Controller:** fix [@Restcontroller](https://github.com/Restcontroller) and [@Controller](https://github.com/Controller) ([e0238fa](https://github.com/gabliam/gabliam/commit/e0238fa))
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
* **controller, methods:** Now you can inject middleware in [@Controller](https://github.com/Controller), [@RestController](https://github.com/RestController), and all me ([e07638b](https://github.com/gabliam/gabliam/commit/e07638b))
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
* **plugin:** add [@Plugin](https://github.com/Plugin) decorator ([b91c306](https://github.com/gabliam/gabliam/commit/b91c306))
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




<a name="3.0.0"></a>
# 3.0.0 (2017-08-14)

* chore(deps): bump deps ([7b3cdfe](https://github.com/gabliam/core/commit/7b3cdfe))
* chore(package): bump version ([27aacd5](https://github.com/gabliam/core/commit/27aacd5))
* feat(config): now config use shortstop ([3010221](https://github.com/gabliam/core/commit/3010221))
* feat(loader): split module and config loader ([2144757](https://github.com/gabliam/core/commit/2144757))
* feat(plugin): add @Plugin decorator ([1ac180f](https://github.com/gabliam/core/commit/1ac180f))
* feat(registry): rewrite registry ([df514fa](https://github.com/gabliam/core/commit/df514fa))
* test: add tests ([595cdc7](https://github.com/gabliam/core/commit/595cdc7))
* feat(@scan): @scan ([1c2b201](https://github.com/gabliam/core/commit/1c2b201))


### BREAKING CHANGE

* Plugins must be decorated by @Plugin

<a name="2.8.0"></a>
# 2.8.0 (2017-08-04)

* chore: bump deps ([d938607](https://github.com/gabliam/core/commit/d938607))
* chore(package): bump version ([f99ca06](https://github.com/gabliam/core/commit/f99ca06))
* chore(package): move remap-istanbul deps to devDeps ([530b2c9](https://github.com/gabliam/core/commit/530b2c9))
* feat(decorators): delete utils ([27417c8](https://github.com/gabliam/core/commit/27417c8))
* feat(gabliam): change plugin ([721abf9](https://github.com/gabliam/core/commit/721abf9))
* fix(loader): fix loader module and add test ([2b14218](https://github.com/gabliam/core/commit/2b14218))
* test: add tests ([86473ec](https://github.com/gabliam/core/commit/86473ec))
* test: add tests ([892fdeb](https://github.com/gabliam/core/commit/892fdeb))
* test: change travis ([c4230ba](https://github.com/gabliam/core/commit/c4230ba))
* test: correction test ([e325148](https://github.com/gabliam/core/commit/e325148))
* test(coverage): add remap coverage ([3f060a8](https://github.com/gabliam/core/commit/3f060a8))
* refactor: glob return all time array => change test ([af2cb13](https://github.com/gabliam/core/commit/af2cb13))



<a name="2.7.0"></a>
# 2.7.0 (2017-07-26)

* chore(package): bump version ([0e5b710](https://github.com/gabliam/core/commit/0e5b710))
* feat(gabliam test): add startPlugins ([d0b12af](https://github.com/gabliam/core/commit/d0b12af))
* feat(gabliam): plugins and options are public (for test) ([3e2e9fd](https://github.com/gabliam/core/commit/3e2e9fd))
* feat(GabliamTest): rename start to build ([9f28550](https://github.com/gabliam/core/commit/9f28550))



<a name="2.6.0"></a>
# 2.6.0 (2017-07-26)

* chore(package): bump version ([0400737](https://github.com/gabliam/core/commit/0400737))
* add class utils for testing ([d51c2a9](https://github.com/gabliam/core/commit/d51c2a9))
* feat(gabliam): loader is public (for test) ([4bf99fd](https://github.com/gabliam/core/commit/4bf99fd))



<a name="2.5.0"></a>
# 2.5.0 (2017-07-16)

* docs(changelog): update changelog ([f7159a0](https://github.com/gabliam/core/commit/f7159a0))
* fix(utils): fix tslint error Shadowed name: 'validate' ([c4d07b6](https://github.com/gabliam/core/commit/c4d07b6))
* chore(mochaConfig): delete mochaConfig.js ([86a12ae](https://github.com/gabliam/core/commit/86a12ae))
* chore(package): bump version ([e76cd0b](https://github.com/gabliam/core/commit/e76cd0b))
* chore(package): correction lint-staged ([00a4f3a](https://github.com/gabliam/core/commit/00a4f3a))
* chore(package): update deps ([a98509c](https://github.com/gabliam/core/commit/a98509c))
* chore(readme): add codecov badge ([6549dab](https://github.com/gabliam/core/commit/6549dab))
* chore(readme): update readme ([e00307c](https://github.com/gabliam/core/commit/e00307c))
* feat(Gabliam): change registry ([2f0f493](https://github.com/gabliam/core/commit/2f0f493))
* fix(process.env.PWD can't be undefined): ([15c5979](https://github.com/gabliam/core/commit/15c5979))
* test(loader, gabliam): add tests for loader and gabliam ([662bdbe](https://github.com/gabliam/core/commit/662bdbe))
* test: add sourceMap and inlineSourceMap for correct coverage ([ce99e3b](https://github.com/gabliam/core/commit/ce99e3b))
* test: delete sourceMap ([77cd779](https://github.com/gabliam/core/commit/77cd779))
* test(all): add coverage ([e3cfca8](https://github.com/gabliam/core/commit/e3cfca8))
* test(all): replace mocha/chai by jest ([b0a1801](https://github.com/gabliam/core/commit/b0a1801))
* test(config): add test for @CoreConfig and @PluginConfig ([b86bd08](https://github.com/gabliam/core/commit/b86bd08))
* test(container): ignore if for coverage ([acd286a](https://github.com/gabliam/core/commit/acd286a))
* test(decorators): test for @value ([82d0d7b](https://github.com/gabliam/core/commit/82d0d7b))
* test(loaderconfig): add test for loader config ([e084c7b](https://github.com/gabliam/core/commit/e084c7b))
* test(path): correction path ([a3a7aed](https://github.com/gabliam/core/commit/a3a7aed))
* test(tests): coverage only for travis ([2a9d58c](https://github.com/gabliam/core/commit/2a9d58c))
* test(value-middleware): add test for value-middleware ([56f57c1](https://github.com/gabliam/core/commit/56f57c1))
* build(path): add jest-serializer-path ([3579664](https://github.com/gabliam/core/commit/3579664))
* build(prettier): update prettier ([4bc5762](https://github.com/gabliam/core/commit/4bc5762))
* refactor(gabliam): delete type on bind<> ([d2efe6b](https://github.com/gabliam/core/commit/d2efe6b))
* refactor(loader): Move profile to method paramater (more easy for testing) ([f996317](https://github.com/gabliam/core/commit/f996317))



<a name="2.4.0"></a>
# 2.4.0 (2017-06-20)

* bump version ([edb6d0d](https://github.com/gabliam/core/commit/edb6d0d))
* style(gabliam, loader): correction order member ([2bb3799](https://github.com/gabliam/core/commit/2bb3799))
* build(tslint): noImplicitAny ([eac7b59](https://github.com/gabliam/core/commit/eac7b59))
* feat(gabliam): add VALUE_EXTRACTOR in di ([6e0de13](https://github.com/gabliam/core/commit/6e0de13))



<a name="2.3.1"></a>
## 2.3.1 (2017-06-20)

* bump version ([5a84ef0](https://github.com/gabliam/core/commit/5a84ef0))
* feat(valueExtractor): valueExtractor take inversify interface container ([cfb8e70](https://github.com/gabliam/core/commit/cfb8e70))
* build(tslint): correction tslint ([81f230a](https://github.com/gabliam/core/commit/81f230a))
* refactor: Change CamelCase for KebabCase ([6bda474](https://github.com/gabliam/core/commit/6bda474))



<a name="2.3.0"></a>
# 2.3.0 (2017-06-15)

* build: add git cz and changelog ([1a05325](https://github.com/gabliam/core/commit/1a05325))
* chore: Bump version ([e3d534c](https://github.com/gabliam/core/commit/e3d534c))
* feat(Gabliam): delete interfaces GabliamOptions and use Partial<GabliamConfig> ([b70009a](https://github.com/gabliam/core/commit/b70009a))
* docs(changelog): add changelog ([ba3a192](https://github.com/gabliam/core/commit/ba3a192))



<a name="2.2.2"></a>
## 2.2.2 (2017-06-13)

* build: Bump version ([5b100a1](https://github.com/gabliam/core/commit/5b100a1))
* fix(config): Correction when application.yml is empty ([a3a7241](https://github.com/gabliam/core/commit/a3a7241))
* upgrade deps ([fad4df8](https://github.com/gabliam/core/commit/fad4df8))



<a name="2.2.1"></a>
## 2.2.1 (2017-06-12)

* build(commit): add husky ([b0da586](https://github.com/gabliam/core/commit/b0da586))
* build(package): add publish-please + bump version ([2ab8923](https://github.com/gabliam/core/commit/2ab8923))
* build(scripts): correction prepublish ([137cc9f](https://github.com/gabliam/core/commit/137cc9f))
* refactor(Bean): Delete target in BeanMetadata ([82ee5fa](https://github.com/gabliam/core/commit/82ee5fa))
* refactor(package.json): delete include-all ([777ff02](https://github.com/gabliam/core/commit/777ff02))
* docs(readme): add badges ([44cad05](https://github.com/gabliam/core/commit/44cad05))
* test(Decorators): add tests ([6346eeb](https://github.com/gabliam/core/commit/6346eeb))
* add readme ([b306e2c](https://github.com/gabliam/core/commit/b306e2c))
* bump version ([e0999df](https://github.com/gabliam/core/commit/e0999df))
* docs(gabliam): ([9c6b233](https://github.com/gabliam/core/commit/9c6b233))
* feat(@Config,@Service,@register): add error when decorated multiple times ([31a3f7f](https://github.com/gabliam/core/commit/31a3f7f))
* style(all): add lint-staged ([6914b2f](https://github.com/gabliam/core/commit/6914b2f))
* style(all): Add prettier ([71520e2](https://github.com/gabliam/core/commit/71520e2))
* feat(value): Add valueExtractor in utils ([aaeb5b4](https://github.com/gabliam/core/commit/aaeb5b4))



<a name="2.1.1"></a>
## 2.1.1 (2017-05-17)

* fix(gabliam): correction process.env() to process.env.PWD ([5281196](https://github.com/gabliam/core/commit/5281196))
* style(all): noImplicitAny ([5b965ed](https://github.com/gabliam/core/commit/5b965ed))
* style(all): remove noImplicitAny include in strict >< ([b538e08](https://github.com/gabliam/core/commit/b538e08))
* refactor(all): reformat code, add strict, change tslint ([9f5f1cd](https://github.com/gabliam/core/commit/9f5f1cd))
* refactor(gabliam): change type of confInstance ([0c9f230](https://github.com/gabliam/core/commit/0c9f230))
* 1.3.0 ([129b56c](https://github.com/gabliam/core/commit/129b56c))
* add app in build plugin ([2dbc79d](https://github.com/gabliam/core/commit/2dbc79d))
* add comments ([9c0b90e](https://github.com/gabliam/core/commit/9c0b90e))
* add debug ([77882db](https://github.com/gabliam/core/commit/77882db))
* add destroy ([09ba696](https://github.com/gabliam/core/commit/09ba696))
* add doc ([387e34d](https://github.com/gabliam/core/commit/387e34d))
* add load module + add @Value ([66f28b8](https://github.com/gabliam/core/commit/66f28b8))
* add validator for @Value ([f2393cb](https://github.com/gabliam/core/commit/f2393cb))
* all refactor, delete global container and register ([181a898](https://github.com/gabliam/core/commit/181a898))
* big refactor. Delete express in core ([aa6a1bd](https://github.com/gabliam/core/commit/aa6a1bd))
* bump version ([f05b5f5](https://github.com/gabliam/core/commit/f05b5f5))
* bump version ([c158979](https://github.com/gabliam/core/commit/c158979))
* bump version ([fc24c77](https://github.com/gabliam/core/commit/fc24c77))
* bump version ([51fda3e](https://github.com/gabliam/core/commit/51fda3e))
* bump version ([2813634](https://github.com/gabliam/core/commit/2813634))
* bump version ([83e7454](https://github.com/gabliam/core/commit/83e7454))
* bump version ([599146b](https://github.com/gabliam/core/commit/599146b))
* bump version ([e532a61](https://github.com/gabliam/core/commit/e532a61))
* bump version ([4e166ce](https://github.com/gabliam/core/commit/4e166ce))
* bump version ([c0809be](https://github.com/gabliam/core/commit/c0809be))
* change destroy ([50d12c8](https://github.com/gabliam/core/commit/50d12c8))
* change discoveryPath => scanPath ([c7489b0](https://github.com/gabliam/core/commit/c7489b0))
* change error msg ([8733e89](https://github.com/gabliam/core/commit/8733e89))
* change struct of plugin ([9f5670e](https://github.com/gabliam/core/commit/9f5670e))
* correction ([f95a074](https://github.com/gabliam/core/commit/f95a074))
* correction ([1d9dedb](https://github.com/gabliam/core/commit/1d9dedb))
* correction ([2a6bd4a](https://github.com/gabliam/core/commit/2a6bd4a))
* correction isValueOptions and isValueValidator ([8d16f21](https://github.com/gabliam/core/commit/8d16f21))
* correction throw ([32603a8](https://github.com/gabliam/core/commit/32603a8))
* correction tslint ([7e7a777](https://github.com/gabliam/core/commit/7e7a777))
* correction types in tsconfig ([6027220](https://github.com/gabliam/core/commit/6027220))
* delete try catch ([d6186c5](https://github.com/gabliam/core/commit/d6186c5))
* expose config ([8005a0f](https://github.com/gabliam/core/commit/8005a0f))
* first commit ([4211688](https://github.com/gabliam/core/commit/4211688))
* load ok ([025a334](https://github.com/gabliam/core/commit/025a334))
* one router by controller ([acdf701](https://github.com/gabliam/core/commit/acdf701))
* readme ([b43c3ea](https://github.com/gabliam/core/commit/b43c3ea))
* refactor binding ([32faeba](https://github.com/gabliam/core/commit/32faeba))
* refactor plugin ([5d901e7](https://github.com/gabliam/core/commit/5d901e7))
* remove inversify-binding-decorators ([33fe108](https://github.com/gabliam/core/commit/33fe108))
* remove lib ([295045a](https://github.com/gabliam/core/commit/295045a))
* rewitre plugin + add scan ([8a1c304](https://github.com/gabliam/core/commit/8a1c304))
* update ts ([f1d90a9](https://github.com/gabliam/core/commit/f1d90a9))
* use validator value ([2643322](https://github.com/gabliam/core/commit/2643322))
* value change ([228767f](https://github.com/gabliam/core/commit/228767f))
* value for property ([7ff7c79](https://github.com/gabliam/core/commit/7ff7c79))
* value with validator throw error by default ([21502c1](https://github.com/gabliam/core/commit/21502c1))




[![Build Status][build-image]][build-url]
[![NPM version][npm-image]][npm-url]


# Gabliam core

Gabliam is on top of inversify.
Gabliam help you for register all class in inversify.
Gabilliam is modular with plugins.


# Gabliam phase

## Build phase

1. Load all config file
2. Load all file in scanPath of main
	- All decorators on class add metadata and can register this class
	- if an class has @scanPath, add this folder in queue for load
	- load all plugin
3. Bind classes in DI (inversify)
	- call all plugin.bind
4. load all config classes (order: CoreConfig => PluginConfig => config)
	- call all plugin.config for all instance of config class
5. Build
	- call all plugin.build

## Start phase
/!\ Build phase must be passed

1. call all plugin.start

## Stop phase
/!\ Build and start phases must be passed

1. call all plugin.start

## Detroy phase
/!\ Stop phase must be passed

1. call all plugin.detroy

# Samples
Go to [Samples]



[Samples]: <https://github.com/gabliam/gabliam/tree/master/examples>

# License

  MIT

[build-image]: https://img.shields.io/travis/gabliam/gabliam/master.svg?style=flat-square
[build-url]: https://travis-ci.org/gabliam/gabliam
[npm-image]: https://img.shields.io/npm/v/@gabliam/core.svg?style=flat-square
[npm-url]: https://github.com/gabliam/core

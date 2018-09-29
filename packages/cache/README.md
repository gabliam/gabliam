[![Build Status][build-image]][build-url]
[![NPM version][npm-image]][npm-url]


# Gabliam amqp

Gabliam plugin for add cache.

# Configuration

Configuration for this plugin is in `application.cacheConfig`

| key  | type | required | default | description |
|--|--|--|--|--|
| cacheManager | string or class |  | SimpleCacheManager | Cache manager to use |
| dynamic |boolean |  | true | When cache is not present in cache manager, if true, auto create cache |
| defaultCache | string or class |  | NoOpCache | if dynamic, it's the default cache to use |
| defaultOptionsCache | object |  |  | if dynamic, it's the default options cache to use |
| cacheMap | Map of [Group configuration](#group-configuration) |  |  | Map of group |


## Group configuration
| key  | type | required | default | description |
|--|--|--|--|--|
| defaultCache | string or class |  | defaultCache of global config | if dynamic, it's the default cache to use |
| defaultOptionsCache | object |  | defaultOptionsCache of global config | if dynamic, it's the default options cache to use |
| caches | Map of [Cache configuration](#cache-configuration) |  |  | Map of cache |


## Cache configuration
| key  | type | required | default | description |
|--|--|--|--|--|
| Cache | string or class | | | Cache to use |
| options | object |  |  | options  |

# License

  MIT

[build-image]: https://img.shields.io/travis/gabliam/gabliam/master.svg?style=flat-square
[build-url]: https://travis-ci.org/gabliam/gabliam
[npm-image]: https://img.shields.io/npm/v/@gabliam/amqp.svg?style=flat-square
[npm-url]: https://github.com/gabliam/amqp

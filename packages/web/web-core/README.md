[![Build Status][build-image]][build-url]
[![NPM version][npm-image]][npm-url]


# Gabliam web-core

Gabliam plugin for add web-core.
All decorators and utils for web

# Concepts

## ServerStarter

This class is used for start the server. By default, use [HttpServerStarter](./src/server-starter.ts)

## REQUEST_LISTENER_CREATOR

Must return an function that create a [RequestListener](./src/interface.ts#L19)
Use by the serverstarter.


# License

  MIT

[build-image]: https://img.shields.io/travis/gabliam/gabliam/master.svg?style=flat-square
[build-url]: https://travis-ci.org/gabliam/gabliam
[npm-image]: https://img.shields.io/npm/v/@gabliam/web-core.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@gabliam/web-core

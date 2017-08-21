[![Build Status][build-image]][build-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][gemnasium-image]][gemnasium-url]
[![codecov][codecov-image]][codecov-url]


# Gabliam log4js

Gabliam plugin for add log4js.

## Install

```sh
$ npm install @gabliam/log4js
```

## How to use

Add plugin

```typescript
import { Gabliam } from '@gabliam/core';

const gab = new Gabliam({
	scanPath: p,
	configPath: p
});

gab.addPlugin(Log4jsPlugin);

gab.buildAndStart();

```

In class

```typescript
import { Service } from '@gabliam/core';
import { log4js } from '@gabliam/log4js';

@Service()
export class SampleService {
	public logger = log4js.getLogger(TestLog.name);

    test() {
        this.logger.info('Info');
        this.logger.debug('debug');
        this.logger.error('error');
        this.logger.fatal('fatal');
        this.logger.warn('warn');
      }
}

```


# License

  MIT

[build-image]: https://img.shields.io/travis/gabliam/log4js/master.svg?style=flat-square
[build-url]: https://travis-ci.org/gabliam/log4js
[npm-image]: https://img.shields.io/npm/v/@gabliam/log4js.svg?style=flat-square
[npm-url]: https://github.com/gabliam/log4js
[gemnasium-image]: http://img.shields.io/gemnasium/gabliam/log4js.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/gabliam/log4js
[codecov-image]: https://img.shields.io/codecov/c/github/gabliam/log4js/master.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/gabliam/log4js

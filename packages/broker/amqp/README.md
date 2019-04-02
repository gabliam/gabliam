[![Build Status][build-image]][build-url]
[![NPM version][npm-image]][npm-url]


# Gabliam amqp

Gabliam plugin for add amqp.

# How to use

## Installation

```sh
$ yarn add @gabliam/amqp
```

## Register plugin
In your main, add amqp plugin

```ts
import 'reflect-metadata';
import * as path from 'path';
import { Gabliam } from '@gabliam/core';
import amqpPlugin from '@gabliam/amqp';

new Gabliam({
  scanPath: __dirname,
  config: path.resolve(__dirname, '../config'),
})
  .addPlugins(amqpPlugin)
  .buildAndStart();
```
## Create a controller

```ts
import { RabbitController, RabbitListener, RabbitConsumer } from '@gabliam/amqp';
@RabbitController()
export class HelloRabbitMq {
  

  @RabbitListener('logHi')
  async logHi() {
    console.log('hi');
  }

  @RabbitConsumer('hello')
  async hello(@Content('name') name: string ) {
    return `hello ${$name}`
  }
}
```


# Configuration

Configuration for this plugin is in `application.amqp`

You can add just one [connection configuration](#connection-configuration) or an array of [connections configurations](#connection-configuration)


## Connection configuration


| key  | type | required | default | description |
|--|--|--|--|--|
| name | string |  | default | name of the connection |
| url | string | X |  | url of the rabbitmq |
| undefinedValue | string |  | $$\_\_##UNDEFINED##\_\_$$ | value that's send when content is undefined |
| queues | Map of [queue configuration](#queue-configuration) | X | | Map of queues |

## Queue configuration

| key  | type | required | default | description |
|--|--|--|--|--|
| queueName | string | X | | name of the queue |
| options.exclusive | boolean |  | false | if true, scopes the queue to the connection (defaults to false) |
| options.durable | boolean |  | false | if true, the queue will survive broker restarts, modulo the effects of exclusive and autoDelete; this defaults to true if not supplied, unlike the others |
| options.autoDelete | boolean |  | false | if true, the queue will be deleted when the number of consumers drops to zero (defaults to false) |

# License

  MIT

[build-image]: https://img.shields.io/travis/gabliam/gabliam/master.svg?style=flat-square
[build-url]: https://travis-ci.org/gabliam/gabliam
[npm-image]: https://img.shields.io/npm/v/@gabliam/amqp.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@gabliam/amqp

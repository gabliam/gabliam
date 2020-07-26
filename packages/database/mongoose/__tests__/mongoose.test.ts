import { MongoosePluginTest } from './mongoose-plugin-test';
import {
  Document,
  MongooseConnection,
  MUnit,
  MongooseConnectionManager,
} from '../src';
import { Gabliam } from '@gabliam/core';
import mongoose from 'mongoose';

interface HeroModel {
  name: string;
}

interface PhotoModel {
  name: string;

  description: string;

  fileName: string;
  views: number;
  isPublished: boolean;
}

let appTest: MongoosePluginTest;
beforeEach(async () => {
  appTest = new MongoosePluginTest();
});

afterEach(async () => {
  try {
    await appTest.destroy();
  } catch (e) {}
});

describe('Errors', () => {
  test('without config folder', async () => {
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });

  test('with bad config', async () => {
    appTest.addConf('application.mongoose', 'bad');
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });

  test('bad repo', async () => {
    appTest.addConf(
      'application.mongoose.uri',
      'mongodb://127.0.0.1/mongoosetest'
    );
    await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
    const connection = appTest.gab.container.get(MongooseConnection);
    expect(() => connection.getRepository('HeroBad')).toThrowError();
  });
});

test('with config uri', async () => {
  appTest.addConf(
    'application.mongoose.uri',
    'mongodb://127.0.0.1/mongoosetest'
  );

  @Document('Hero')
  class Hero {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      });
    }
  }

  appTest.addClass(Hero);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(MongooseConnection);
  const repo = connection.getRepository<HeroModel>('Hero');
  let res = await repo.findAll();
  expect(res).toMatchSnapshot();
  await repo.create({
    name: 'test',
  });
  res = await repo.findAll();
  expect(res[0].name).toMatchSnapshot();
  await connection.conn.dropDatabase();
});

test('with one connection with name and entity without munit', async () => {
  appTest.addConf('application.mongoose', {
    uri: 'mongodb://127.0.0.1/mongoosetest',
    name: 'test',
  });

  @Document('Hero')
  class Hero {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      });
    }
  }

  appTest.addClass(Hero);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(MongooseConnection);
  const repo = connection.getRepository<HeroModel>('Hero');
  let res = await repo.findAll();
  expect(res).toMatchSnapshot();
  await repo.create({
    name: 'testoneconnection',
  });
  res = await repo.findAll();
  expect(res[0].name).toMatchSnapshot();
  await connection.conn.dropDatabase();
});

test('with config 2 database', async () => {
  appTest.addConf('application.mongoose', [
    {
      name: 'connection1',
      uri: 'mongodb://127.0.0.1/mongoosetestconnection1',
    },
    {
      name: 'connection2',
      uri: 'mongodb://127.0.0.1/mongoosetestconnection2',
    },
  ]);

  @MUnit('connection1')
  @Document('Photo')
  class Photo {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        views: Number,
        isPublished: Boolean,
      });
    }
  }
  appTest.addClass(Photo);

  @MUnit('connection2')
  @Document('Hero')
  class Hero {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      });
    }
  }
  appTest.addClass(Photo);
  appTest.addClass(Hero);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);

  const connection = appTest.gab.container.get(MongooseConnectionManager);

  const repo = connection
    .getConnection('connection1')
    .getRepository<PhotoModel>('Photo');
  let res = await repo.findAll();
  expect(res).toMatchSnapshot();
  await repo.create({
    name: 'test',
    description: 'test desc',
    fileName: 'testfile',
    views: 0,
    isPublished: false,
  });
  res = await repo.findAll();
  expect(res[0].name).toMatchSnapshot();

  const repo2 = connection
    .getConnection('connection2')
    .getRepository<HeroModel>('Hero');
  let res2 = await repo2.findAll();
  expect(res2).toMatchSnapshot();
  await repo2.create({
    name: 'test hero',
  });
  res2 = await repo2.findAll();
  expect(res2[0].name).toMatchSnapshot();
  await connection.getConnection('connection1').conn.dropDatabase();
  await connection.getConnection('connection2').conn.dropDatabase();
});

test('must fail when MUnit not found', async () => {
  appTest.addConf('application.mongoose', {
    uri: 'mongodb://127.0.0.1/mongoosetestbadMunit',
  });

  @MUnit('bad')
  @Document('Photo')
  class Photo {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        views: Number,
        isPublished: Boolean,
      });
    }
  }
  appTest.addClass(Photo);
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('must fail when getConnection not found', async () => {
  appTest.addConf('application.mongoose', {
    uri: 'mongodb://127.0.0.1/mongoosetestbadMunit',
  });

  @Document('Photo')
  class Photo {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        views: Number,
        isPublished: Boolean,
      });
    }
  }

  appTest.addClass(Photo);
  await appTest.gab.buildAndStart();
  const connection = appTest.gab.container.get(MongooseConnectionManager);
  await expect(() =>
    connection.getConnection('notfound')
  ).toThrowErrorMatchingSnapshot();
});

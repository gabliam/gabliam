import { MongoosePluginTest } from './mongoose-plugin-test';
import { Document, MongooseConnection } from '../src';
import { Gabliam } from '@gabliam/core';
import * as mongoose from 'mongoose';

interface HeroModel {
  name: string;
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

  test('with host without database_name', async () => {
    appTest.addConf('application.mongoose', {
      host: 'localhost'
    });
    await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
  });

  test('with host and database_name and unknown value', async () => {
    appTest.addConf('application.mongoose', {
      host: 'localhost',
      database_name: 'test',
      lol: 'test'
    });
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
          required: true
        }
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
    name: 'test'
  });
  res = await repo.findAll();
  expect(res[0].name).toMatchSnapshot();
  await connection.conn.dropDatabase();
});

test('with config host & database', async () => {
  appTest.addConf('application.mongoose', {
    host: '127.0.0.1',
    database_name: 'mongoosetest'
  });

  @Document('Hero')
  class Hero {
    static getSchema() {
      return new mongoose.Schema({
        name: {
          type: String,
          required: true
        }
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
    name: 'test'
  });
  res = await repo.findAll();
  expect(res[0].name).toMatchSnapshot();
  await connection.conn.dropDatabase();
});

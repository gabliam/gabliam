import { TypeormPluginTest } from './typeorm-plugin-test';
import { Entity, Column, PrimaryGeneratedColumn, Connection } from '../src';
import { Gabliam } from '@gabliam/core';

let appTest: TypeormPluginTest;
beforeEach(async () => {
  appTest = new TypeormPluginTest();
});

afterEach(async () => {
  try {
    await appTest.destroy();
  } catch (e) {}
});

test('without config folder', async () => {
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('with bad config', async () => {
  appTest.addConf('application.typeorm.connectionOptions', 'bad');
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('with no driver', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    driver: {
      type: 'postgres',
      host: 'localhost',
      username: 'test',
      password: 'test',
      database: 'test'
    },
    autoSchemaSync: true
  });
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('with config', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    driver: {
      type: 'sqlite',
      storage: 'test.sqlite'
    },
    autoSchemaSync: true
  });

  @Entity()
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500
    })
    name: string;

    @Column('text') description: string;

    @Column() fileName: string;

    @Column('int') views: number;

    @Column() isPublished: boolean;
  }
  appTest.addClass(Photo);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);
  const connection = appTest.gab.container.get(Connection);
  expect(connection.isConnected).toMatchSnapshot();
  const repo = connection.getRepository<Photo>('Photo');
  let res = await repo.find();
  expect(res).toMatchSnapshot();
  await repo.persist({
    name: 'test',
    description: 'test desc',
    fileName: 'testfile',
    views: 0,
    isPublished: false
  });
  res = await repo.find();
  expect(res).toMatchSnapshot();
  await connection.dropDatabase();
});

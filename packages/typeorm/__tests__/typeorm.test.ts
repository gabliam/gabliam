import { TypeormPluginTest } from './typeorm-plugin-test';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Connection,
  ConnectionManager,
  CUnit
} from '../src';
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
    type: 'postgres',
    host: 'localhost',
    username: 'test',
    password: 'test',
    database: 'test',
    synchronize: true
  });
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('with config', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    type: 'sqlite',
    database: 'test.sqlite',
    synchronize: true
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
  await repo.save({
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

test('with config 2 database', async () => {
  appTest.addConf('application.typeorm.connectionOptions', [
    {
      type: 'sqlite',
      name: 'connection1',
      database: 'test2.sqlite',
      synchronize: true
    },
    {
      type: 'sqlite',
      name: 'connection2',
      database: 'test3.sqlite',
      synchronize: true
    }
  ]);

  @CUnit('connection1')
  @Entity('Photo')
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

  @CUnit('connection2')
  @Entity('Heroes')
  class Heroes {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500
    })
    name: string;

    @Column() power: string;
  }
  appTest.addClass(Photo);
  appTest.addClass(Heroes);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);

  const connection = appTest.gab.container.get(ConnectionManager);

  const repo = connection
    .getConnection('connection1')
    .getRepository<Photo>('Photo');
  let res = await repo.find();
  expect(res).toMatchSnapshot();
  await repo.save({
    name: 'test',
    description: 'test desc',
    fileName: 'testfile',
    views: 0,
    isPublished: false
  });
  res = await repo.find();
  expect(res).toMatchSnapshot();

  const repo2 = connection
    .getConnection('connection2')
    .getRepository<Heroes>('Heroes');
  let res2 = await repo2.find();
  expect(res2).toMatchSnapshot();
  await repo2.save({
    name: 'test',
    power: 'test power'
  });
  res2 = await repo2.find();
  expect(res2).toMatchSnapshot();

  await connection.getConnection('connection1').dropDatabase();
  await connection.getConnection('connection2').dropDatabase();
});

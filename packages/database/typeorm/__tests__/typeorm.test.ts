import { Gabliam } from '@gabliam/core';
import {
  Column,
  Connection,
  ConnectionManager,
  CUnit,
  Entity,
  PrimaryGeneratedColumn,
} from '../src';
import { TypeormPluginTest } from './typeorm-plugin-test';

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
    synchronize: true,
  });
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('with config', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    type: 'sqlite',
    database: 'test.sqlite',
    synchronize: true,
  });

  @Entity()
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
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
    isPublished: false,
  });
  res = await repo.find();
  expect(res).toMatchSnapshot();
  await connection.dropDatabase();
});

test('with one connection with name and entity without cunit', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    type: 'sqlite',
    name: 'testoneconnection',
    database: 'testoneconnection.sqlite',
    synchronize: true,
  });

  @Entity()
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
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
    isPublished: false,
  });
  res = await repo.find();
  expect(res).toMatchSnapshot();
  await connection.dropDatabase();
});

test('withcunit in config', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    type: 'sqlite',
    name: 'withcunit',
    database: 'withcunit.sqlite',
    synchronize: true,
  });

  appTest.addConf('application.photo', 'withcunit');

  @CUnit('application.photo')
  @Entity()
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
    })
    name: string;

    @Column('text') description: string;

    @Column() fileName: string;

    @Column('int') views: number;

    @Column() isPublished: boolean;
  }
  appTest.addClass(Photo);

  await expect(appTest.gab.buildAndStart()).resolves.toBeInstanceOf(Gabliam);

  const connection = appTest.gab.container.get(ConnectionManager);

  const repo = connection
    .getConnection('withcunit')
    .getRepository<Photo>('Photo');

  let res = await repo.find();
  expect(res).toMatchSnapshot();
  await repo.save({
    name: 'test',
    description: 'test desc',
    fileName: 'testfile',
    views: 0,
    isPublished: false,
  });
  res = await repo.find();
  expect(res).toMatchSnapshot();
  await connection.getConnection('withcunit').dropDatabase();
});

test('with config 2 database', async () => {
  appTest.addConf('application.typeorm.connectionOptions', [
    {
      type: 'sqlite',
      name: 'connection1',
      database: 'test2.sqlite',
      synchronize: true,
    },
    {
      type: 'sqlite',
      name: 'connection2',
      database: 'test3.sqlite',
      synchronize: true,
    },
  ]);

  @CUnit('connection1')
  @Entity('Photo')
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
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
      length: 500,
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
    isPublished: false,
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
    power: 'test power',
  });
  res2 = await repo2.find();
  expect(res2).toMatchSnapshot();

  await connection.getConnection('connection1').dropDatabase();
  await connection.getConnection('connection2').dropDatabase();
});

test('must fail when CUnit not found', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    type: 'sqlite',
    database: 'cunitnotfound.sqlite',
    synchronize: true,
  });

  @CUnit('bad')
  @Entity('Photo')
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
    })
    name: string;
  }
  appTest.addClass(Photo);
  await expect(appTest.gab.buildAndStart()).rejects.toMatchSnapshot();
});

test('must fail when getConnection not found', async () => {
  appTest.addConf('application.typeorm.connectionOptions', {
    name: 'getConnection',
    type: 'sqlite',
    database: 'getConnection.sqlite',
    synchronize: true,
  });

  @CUnit('getConnection')
  @Entity('Photo')
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
    })
    name: string;
  }

  appTest.addClass(Photo);
  await appTest.gab.buildAndStart();
  const connection = appTest.gab.container.get(ConnectionManager);
  await expect(() =>
    connection.getConnection('notfound')
  ).toThrowErrorMatchingSnapshot();
});

test('with config 2 database and one entity on 2 connection', async () => {
  appTest.addConf('application.typeorm.connectionOptions', [
    {
      type: 'sqlite',
      name: 'connection1',
      database: 'test4.sqlite',
      synchronize: true,
    },
    {
      type: 'sqlite',
      name: 'connection2',
      database: 'test5.sqlite',
      synchronize: true,
    },
  ]);

  @CUnit('connection1')
  @CUnit('connection2')
  @Entity('Photo')
  class Photo {
    @PrimaryGeneratedColumn() id?: number;

    @Column({
      length: 500,
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
      length: 500,
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
    isPublished: false,
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
    power: 'test power',
  });
  res2 = await repo2.find();
  expect(res2).toMatchSnapshot();

  const repo3 = connection
    .getConnection('connection2')
    .getRepository<Photo>('Photo');
  let res3 = await repo3.find();
  expect(res3).toMatchSnapshot();
  await repo3.save({
    name: 'test',
    description: 'test desc',
    fileName: 'testfile',
    views: 0,
    isPublished: false,
  });
  res3 = await repo3.find();
  expect(res3).toMatchSnapshot();

  await connection.getConnection('connection1').dropDatabase();
  await connection.getConnection('connection2').dropDatabase();
});

import { MongoosePluginTest } from './mongoose-plugin-test';
import { Document, MongooseConnection } from '../src';
import * as mongoose from 'mongoose';

interface HeroModel {
  name: string;
}

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

let appTest: MongoosePluginTest;
let connection: MongooseConnection;

beforeEach(async () => {
  appTest = new MongoosePluginTest();
  appTest.addConf(
    'application.mongoose.uri',
    'mongodb://127.0.0.1/mongoosetest'
  );

  appTest.addClass(Hero);
  await appTest.gab.buildAndStart();
  connection = appTest.gab.container.get(MongooseConnection);
  await connection.conn.dropDatabase();
});

afterEach(async () => {
  try {
    await connection.conn.dropDatabase();
    await appTest.destroy();
  } catch (e) {}
});

describe('connection get Repo', () => {
  test('getRespository(string)', async () => {
    let repo = connection.getRepository<HeroModel>('Hero');
    expect(repo).toMatchSnapshot();
    repo = connection.getRepository<HeroModel>('Hero'); // for test cache
    expect(repo).toMatchSnapshot();
  });

  test('getRespository(clazz)', async () => {
    let repo = connection.getRepository<HeroModel>(Hero);
    expect(repo).toMatchSnapshot();
    repo = connection.getRepository<HeroModel>(Hero); // for test cache
    expect(repo).toMatchSnapshot();
  });
});

describe('repository methods', () => {
  test('create / findAll', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    let res = await repo.findAll();
    expect(res).toMatchSnapshot();
    await repo.create({
      name: 'test'
    });
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
  });

  test('update with ObjectId', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    let res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
    hero.name = 'testupdate';
    await repo.update(hero._id, hero);
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
  });

  test('update with id', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    let res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
    hero.name = 'testupdate';
    await repo.update(hero.id!, hero);
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
  });

  test('delete with id', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    let res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
    await repo.delete(hero.id!);
    res = await repo.findAll();
    expect(res).toMatchSnapshot();
  });

  test('delete with ObjectId', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    let res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    res = await repo.findAll();
    expect(res[0].name).toMatchSnapshot();
    await repo.delete(hero._id);
    res = await repo.findAll();
    expect(res).toMatchSnapshot();
  });

  test('findById with ObjectId', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    const res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    const res2 = await repo.findById(hero._id);
    expect(res2!.name).toMatchSnapshot();
  });

  test('findById with id', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    const res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    const res2 = await repo.findById(hero.id!);
    expect(res2!.name).toMatchSnapshot();
  });

  test('findOne', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    const res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    const res2 = await repo.findOne({ _id: hero._id });
    expect(res2!.name).toMatchSnapshot();
  });

  test('find', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    const res = await repo.findAll();
    expect(res).toMatchSnapshot();
    const hero = await repo.create({
      name: 'test'
    });
    let res2 = await repo.find({ _id: hero._id });
    expect(res2[0]!.name).toMatchSnapshot();
    res2 = await repo.find({});
    expect(res2[0]!.name).toMatchSnapshot();
  });

  test('deleteAll', async () => {
    const repo = connection.getRepository<HeroModel>(Hero);
    let res = await repo.findAll();
    expect(res).toMatchSnapshot();
    await repo.create({
      name: 'test'
    });
    await repo.create({
      name: 'test2'
    });
    res = await repo.findAll();
    expect(res[0]!.name).toMatchSnapshot();
    expect(res[1]!.name).toMatchSnapshot();
    await repo.deleteAll();
    res = await repo.findAll();
    expect(res).toMatchSnapshot();
  });
});

// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { LoaderConfig, FileLoader } from '../src/loaders';
// import * as mock from 'mock-fs';
import { MockFs } from './mock-fs';
import * as path from 'path';

let loader: LoaderConfig;
beforeEach(async () => {
  loader = new LoaderConfig();
});

test(`with config folder doesn't exist`, async () => {
  const config = await loader.load(__dirname, 'doesntexist/config');
  expect(config).toMatchSnapshot();
});

test(`with bad application.yml`, async () => {
  const config = loader.load(path.resolve(__dirname, './fixtures/badyml'));
  await expect(config).rejects.toMatchSnapshot();
});

test(`with application.yml empty`, async () => {
  const mock = new MockFs({
    'test/config': {
      'application.yml': ``,
    },
  });
  const config = await loader.load(mock.resolve('test/config'));
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with application.yml with nothing`, async () => {
  const mock = new MockFs({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.yml': `

              `,
    },
  });
  const config = await loader.load(mock.resolve('test/config'));
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with application.yml`, async () => {
  const config = await loader.load(
    path.resolve(__dirname, './fixtures/config')
  );
  expect(config).toMatchSnapshot();
});

describe('with application.yml', () => {
  let mock: MockFs;
  beforeAll(async () => {
    mock = new MockFs({
      'test/config': {
        'application.yml': `
              application:
                host: 127.0.0.1
                db: test
              testPath: path:./test.json
            `,
        'application-prod.yml': `
              application:
                host: prod.app.com
            `,
      },
    });
  });

  test('load application.yml', async () => {
    const config = await loader.load(mock.resolve('test/config'));
    expect(config).toMatchSnapshot();
  });

  test('load with bad profile', async () => {
    const config = await loader.load(mock.resolve('test/config'), 'int');
    expect(config).toMatchSnapshot();
  });

  test('load with prod profile', async () => {
    const config = await loader.load(mock.resolve('test/config'), 'prod');
    expect(config).toMatchSnapshot();
  });

  afterAll(() => mock.restore());
});

describe('with application.yml with bad handler', () => {
  let mock: MockFs;
  beforeAll(async () => {
    mock = new MockFs({
      'test/config': {
        'application.yml': `
              application:
                host: 127.0.0.1
                db: test
              testPath: file:./test.json
            `,
        'application-prod.yml': `
              application:
                host: prod.app.com
            `,
      },
    });
  });

  test('must throw error', async () => {
    const config = loader.load(mock.resolve('test/config'), 'int');
    await expect(config).rejects.toMatchSnapshot();
  });

  afterAll(() => mock.restore());
});

test(`with application.json`, async () => {
  const config = await loader.load([
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/config'),
        types: ['json'],
      },
    },
  ]);
  expect(config).toMatchSnapshot();
});

test(`with json and yml`, async () => {
  const config = await loader.load([
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/config'),
        types: ['json', 'yml'],
      },
    },
  ]);
  expect(config).toMatchSnapshot();
});

test(`with yml and json`, async () => {
  const config = await loader.load([
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/config'),
        types: ['yml', 'json'],
      },
    },
  ]);
  expect(config).toMatchSnapshot();
});

test(`with bad application.json`, async () => {
  const config = loader.load([
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/badjson'),
        types: ['json'],
      },
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
});

test(`with application.json empty`, async () => {
  const mock = new MockFs({
    'test/config': {
      'application.json': ``,
    },
  });
  const config = loader.load([
    {
      loader: FileLoader,
      options: {
        folder: mock.resolve('test/config'),
        types: ['json'],
      },
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
  mock.restore();
});

test(`with application.json with nothing`, async () => {
  const mock = new MockFs({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.json': `

              `,
    },
  });
  const config = loader.load([
    {
      loader: FileLoader,
      options: {
        folder: mock.resolve('test/config'),
        types: ['json'],
      },
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
  mock.restore();
});

test(`with bad parser`, async () => {
  const config = loader.load([
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/badparser'),
        types: ['badparser'],
      },
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
});

test(`with bad loader`, async () => {
  const config = loader.load([
    {
      loader: 'BadLoader',
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
});

test(`with toml`, async () => {
  const mock = new MockFs({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.toml': `
[application]
host = "127.0.0.1"
db = "test"

testPath = "path:./test.json"`,
    },
  });
  const config = await loader.load([
    {
      loader: FileLoader,
      options: {
        folder: mock.resolve('test/config'),
        types: ['toml'],
      },
    },
  ]);
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with bad toml`, async () => {
  const mock = new MockFs({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.toml': `
;;;;[application]
host = "127.0.0.1"
db = "test"

testPath = "path:./test.json"`,
    },
  });
  const config = loader.load([
    {
      loader: FileLoader,
      options: {
        folder: mock.resolve('test/config'),
        types: ['toml'],
      },
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
  mock.restore();
});

test(`with properties`, async () => {
  const mock = new MockFs({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.properties': `
application.host = 127.0.0.1
application.db = test
testPath = path:./test.json`,
    },
  });
  const config = await loader.load([
    {
      loader: FileLoader,
      options: {
        folder: mock.resolve('test/config'),
        types: ['properties'],
      },
    },
  ]);
  expect(config).toMatchSnapshot();
  mock.restore();
});

test.skip(`with bad properties`, async () => {
  const mock = new MockFs({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.properties': `
    ####😁😁$$$[application]
      host = "127.0.0.1"
db = "test"

testPath = "path:./test.json"`,
    },
  });
  const config = loader.load([
    {
      loader: FileLoader,
      options: {
        folder: mock.resolve('test/config'),
        types: ['properties'],
      },
    },
  ]);
  await expect(config).rejects.toMatchSnapshot();
  mock.restore();
});

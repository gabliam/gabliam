// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { LoaderConfig, FileLoader } from '../src/loaders';
import * as mock from 'mock-fs';
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
  const config = await loader.load(
    __dirname,
    path.resolve(__dirname, './fixtures/badyml')
  );
  expect(config).toMatchSnapshot();
});

test(`with application.yml empty`, async () => {
  mock({
    'test/config': {
      'application.yml': ``
    }
  });
  const config = await loader.load(__dirname, 'test/config');
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with application.yml with nothing`, async () => {
  mock({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.yml': `

              `
    }
  });
  const config = await loader.load(__dirname, 'test/config');
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with application.yml`, async () => {
  const config = await loader.load(
    __dirname,
    path.resolve(__dirname, './fixtures/config')
  );
  expect(config).toMatchSnapshot();
});

describe('with application.yml', async () => {
  beforeAll(async () => {
    mock({
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
            `
      }
    });
  });

  test('load application.yml', async () => {
    const config = await loader.load(__dirname, 'test/config');
    expect(config).toMatchSnapshot();
  });

  test('load with bad profile', async () => {
    const config = await loader.load(__dirname, 'test/config', 'int');
    expect(config).toMatchSnapshot();
  });

  test('load with prod profile', async () => {
    const config = await loader.load(__dirname, 'test/config', 'prod');
    expect(config).toMatchSnapshot();
  });

  afterAll(() => mock.restore());
});

describe('with application.yml with bad handler', async () => {
  beforeAll(async () => {
    mock({
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
            `
      }
    });
  });

  test('must throw error', async () => {
    const config = loader.load(__dirname, 'test/config', 'int');
    await expect(config).rejects.toMatchSnapshot();
  });

  afterAll(() => mock.restore());
});

test(`with application.json`, async () => {
  const config = await loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/config'),
        types: ['json']
      }
    }
  ]);
  expect(config).toMatchSnapshot();
});

test(`with json and yml`, async () => {
  const config = await loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/config'),
        types: ['json', 'yml']
      }
    }
  ]);
  expect(config).toMatchSnapshot();
});

test(`with yml and json`, async () => {
  const config = await loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/config'),
        types: ['yml', 'json']
      }
    }
  ]);
  expect(config).toMatchSnapshot();
});

test(`with bad application.json`, async () => {
  const config = await loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/badjson'),
        types: ['json']
      }
    }
  ]);
  expect(config).toMatchSnapshot();
});

test(`with application.json empty`, async () => {
  mock({
    'test/config': {
      'application.json': ``
    }
  });
  const config = await loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: 'test/config',
        types: ['json']
      }
    }
  ]);
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with application.json with nothing`, async () => {
  mock({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.json': `

              `
    }
  });
  const config = await loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: 'test/config',
        types: ['json']
      }
    }
  ]);
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with bad parser`, async () => {
  const config = loader.load(__dirname, [
    {
      loader: FileLoader,
      options: {
        folder: path.resolve(__dirname, './fixtures/badparser'),
        types: ['badparser']
      }
    }
  ]);
  await expect(config).rejects.toMatchSnapshot();
});

test(`with bad loader`, async () => {
  const config = loader.load(__dirname, [
    {
      loader: 'BadLoader'
    }
  ]);
  await expect(config).rejects.toMatchSnapshot();
});

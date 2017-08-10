// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { LoaderConfig } from '../src/loaders';
import * as mock from 'mock-fs';
import * as path from 'path';

let loader: LoaderConfig;
beforeEach(() => {
  loader = new LoaderConfig();
});

test(`with config folder doesn't exist`, () => {
  const config = loader.load('doesntexist/config');
  expect(config).toMatchSnapshot();
});

test(`with bad application.yml`, () => {
  const config = loader.load(path.resolve(__dirname, './fixtures/badyml'));
  expect(config).toMatchSnapshot();
});

test(`with application.yml empty`, () => {
  mock({
    'test/config': {
      'application.yml': ``
    }
  });
  const config = loader.load('test/config');
  expect(config).toMatchSnapshot();
  mock.restore();
});

test(`with application.yml with nothing`, () => {
  mock({
    'test/config': {
      // tslint:disable-next-line:no-trailing-whitespace
      'application.yml': `

              `
    }
  });
  const config = loader.load('test/config');
  expect(config).toEqual({});
  mock.restore();
});

describe('with application.yml', () => {
  beforeAll(() => {
    mock({
      'test/config': {
        'application.yml': `
              application:
                host: 127.0.0.1
                db: test
            `,
        'application-prod.yml': `
              application:
                host: prod.app.com
            `
      }
    });
  });

  test('load application.yml', () => {
    const config = loader.load('test/config');
    expect(config).toMatchSnapshot();
  });

  test('load with bad profile', () => {
    const config = loader.load('test/config', 'int');
    expect(config).toMatchSnapshot();
  });

  test('load with prod profile', () => {
    const config = loader.load('test/config', 'prod');
    expect(config).toMatchSnapshot();
  });

  afterAll(() => mock.restore());
});

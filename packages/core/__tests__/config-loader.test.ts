// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { Loader } from '../src/loader';
import * as mock from 'mock-fs';
import * as path from 'path';

let loader: Loader;
beforeEach(() => {
  loader = new Loader();
});

test(`with config folder doesn't exist`, () => {
  const config = loader.loadConfig('doesntexist/config');
  expect(config).toMatchSnapshot();
});

test(`with bad application.yml`, () => {
  const config = loader.loadConfig(
    path.resolve(__dirname, './fixtures/badyml')
  );
  expect(config).toMatchSnapshot();
});

test(`with application.yml empty`, () => {
  mock({
    'test/config': {
      'application.yml': ``
    }
  });
  const config = loader.loadConfig('test/config');
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
  const config = loader.loadConfig('test/config');
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
    const config = loader.loadConfig('test/config');
    expect(config).toMatchSnapshot();
  });

  test('load with bad profile', () => {
    const config = loader.loadConfig('test/config', 'int');
    expect(config).toMatchSnapshot();
  });

  test('load with prod profile', () => {
    const config = loader.loadConfig('test/config', 'prod');
    expect(config).toMatchSnapshot();
  });

  afterAll(() => mock.restore());
});

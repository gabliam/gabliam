// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { expect } from 'chai';
import { Loader } from '../src/loader';
import * as mock from 'mock-fs';

describe('Unit Test: config loader', () => {
  let loader: Loader;
  beforeEach(() => {
    loader = new Loader();
  });

  it(`with config folder doesn't exist`, () => {
    const config = loader.loadConfig('doesntexist/config');
    expect(config).to.deep.equal({});
  });

  it(`with application.yml empty`, () => {
    mock({
      'test/config': {
        'application.yml': ``
      }
    });
    const config = loader.loadConfig('test/config');
    expect(config).to.deep.equal({});
    mock.restore();
  });

  it(`with application.yml with nothing`, () => {
    mock({
      'test/config': {
        // tslint:disable-next-line:no-trailing-whitespace
        'application.yml': `

              `
      }
    });
    const config = loader.loadConfig('test/config');
    expect(config).to.deep.equal({});
    mock.restore();
  });

  describe('with application.yml', () => {
    before(() => {
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

    it('load application.yml', () => {
      const config = loader.loadConfig('test/config');
      expect(config).to.deep.equal({
        application: {
          host: '127.0.0.1',
          db: 'test'
        }
      });
    });

    it('load with bad profile', () => {
      const config = loader.loadConfig('test/config', 'int');
      expect(config).to.deep.equal({
        application: {
          host: '127.0.0.1',
          db: 'test'
        }
      });
    });

    it('load with prod profile', () => {
      const config = loader.loadConfig('test/config', 'prod');
      expect(config).to.deep.equal({
        application: {
          host: 'prod.app.com',
          db: 'test'
        }
      });
    });

    after(() => mock.restore());
  });
});

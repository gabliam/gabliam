// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { Loader } from '../src/loader';
import * as path from 'path';

describe('Unit Test: loader', () => {
  let loader: Loader;
  beforeEach(() => {
    loader = new Loader();
  });

  it('whitout other scan', () => {
    const registry = loader.loadModules(
      path.resolve(__dirname, './fixtures/loader/withoutscan'),
      []
    );
    expect(registry).toMatchSnapshot();
    expect(loader).toMatchSnapshot();
  });

  it('with scan', () => {
    const registry = loader.loadModules(
      path.resolve(__dirname, './fixtures/loader/withscan'),
      []
    );
    expect(registry).toMatchSnapshot();
    expect(loader).toMatchSnapshot();
  });
});

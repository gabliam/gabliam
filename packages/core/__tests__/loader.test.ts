// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { Loader } from '../src/loader';
import * as path from 'path';
import { Scan } from '../src/index';
import { METADATA_KEY } from '../src/constants';

let loader: Loader;
beforeEach(() => {
  loader = new Loader();
});

test('whitout other scan', () => {
  const registry = loader.loadModules(
    path.resolve(__dirname, './fixtures/loader/withoutscan'),
    []
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

test('with scan', () => {
  const registry = loader.loadModules(
    path.resolve(__dirname, './fixtures/loader/withscan'),
    []
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

test('with plugin', () => {
  @Scan(path.resolve(__dirname, './fixtures/loader/withscan'))
  class Plugin {}

  const registry = loader.loadModules(
    path.resolve(__dirname, './fixtures/loader/withoutscan'),
    [new Plugin()]
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

test('with plugin and false scan path', () => {
  class Plugin {}

  Reflect.defineMetadata(METADATA_KEY.scan, [], Plugin);

  const registry = loader.loadModules(
    path.resolve(__dirname, './fixtures/loader/withoutscan'),
    [new Plugin()]
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

import path from 'path';
import { METADATA_KEY } from '../src/constants';
import { Scan } from '../src/index';
import { LoaderModule } from '../src/loaders';

let loader: LoaderModule;
beforeEach(() => {
  loader = new LoaderModule();
});

test('whitout other scan', () => {
  const registry = loader.load(
    path.resolve(__dirname, './fixtures/loader/withoutscan'),
    [],
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

test('with scan', () => {
  const registry = loader.load(
    path.resolve(__dirname, './fixtures/loader/withscan'),
    [],
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

test('with plugin', () => {
  @Scan(path.resolve(__dirname, './fixtures/loader/withscan'))
  class Plugin {}

  const registry = loader.load(
    path.resolve(__dirname, './fixtures/loader/withoutscan'),
    [new Plugin()],
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

test('with plugin and false scan path', () => {
  class Plugin {}

  Reflect.defineMetadata(METADATA_KEY.scan, [], Plugin);

  const registry = loader.load(
    path.resolve(__dirname, './fixtures/loader/withoutscan'),
    [new Plugin()],
  );
  expect(registry).toMatchSnapshot();
  expect(loader).toMatchSnapshot();
});

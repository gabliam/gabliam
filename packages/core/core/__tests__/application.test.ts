// tslint:disable:one-line
// tslint:disable:no-unused-expression
import { gabliamFinder, gabliamBuilder, gabliamFindApp } from '../src';
import { resolve } from 'path';

describe('gabliamFinder', () => {
  describe('one application', () => {
    test('app without config', async () => {
      const apps = await gabliamFinder(
        resolve(__dirname, './fixtures/applications/one/withoutconfig')
      );
      expect(apps).toMatchSnapshot();
      const gab = await gabliamBuilder(apps[0]);
      expect(gab).toMatchSnapshot();
    });

    test('app with config', async () => {
      const apps = await gabliamFinder(
        resolve(__dirname, './fixtures/applications/one/withconfig')
      );
      expect(apps).toMatchSnapshot();
      const gab = await gabliamBuilder(apps[0]);
      expect(gab).toMatchSnapshot();
    });

    test('no app found', async () => {
      const apps = await gabliamFinder(
        resolve(__dirname, './fixtures/applications/one/gabliam')
      );
      expect(apps).toMatchSnapshot();
      expect(gabliamBuilder(apps[0])).rejects.toMatchSnapshot();
    });
  });

  describe('2 applications', () => {
    test('app', async () => {
      const apps = await gabliamFinder(
        resolve(__dirname, './fixtures/applications/two')
      );
      expect(apps).toMatchSnapshot();
      expect(gabliamBuilder(apps[0])).resolves.toMatchSnapshot();
      expect(gabliamBuilder(apps[1])).resolves.toMatchSnapshot();
    });
  });
});

describe('gabliamFindApp', () => {
  describe('without appName', () => {
    describe('one application', () => {
      test('app without config', async () => {
        const apps = await gabliamFindApp(
          resolve(__dirname, './fixtures/applications/one/withoutconfig')
        );
        expect(apps).toMatchSnapshot();
        const gab = await gabliamBuilder(apps);
        expect(gab).toMatchSnapshot();
      });

      test('app with config', async () => {
        const apps = await gabliamFindApp(
          resolve(__dirname, './fixtures/applications/one/withconfig')
        );
        expect(apps).toMatchSnapshot();
        const gab = await gabliamBuilder(apps);
        expect(gab).toMatchSnapshot();
      });

      test('no app found', async () => {
        expect(
          gabliamFindApp(
            resolve(__dirname, './fixtures/applications/one/gabliam')
          )
        ).rejects.toMatchSnapshot();
      });
    });

    describe('2 applications', () => {
      test('too many', async () => {
        expect(
          gabliamFindApp(resolve(__dirname, './fixtures/applications/two'))
        ).rejects.toMatchSnapshot();
      });
    });
  });

  describe('with appName', () => {
    describe('one application', () => {
      test('app without config', async () => {
        const apps = await gabliamFindApp(
          resolve(__dirname, './fixtures/applications/one/withoutconfig'),
          'MyApp'
        );
        expect(apps).toMatchSnapshot();
        const gab = await gabliamBuilder(apps);
        expect(gab).toMatchSnapshot();
      });

      test('app with config', async () => {
        const apps = await gabliamFindApp(
          resolve(__dirname, './fixtures/applications/one/withconfig'),
          'MyApp'
        );
        expect(apps).toMatchSnapshot();
        const gab = await gabliamBuilder(apps);
        expect(gab).toMatchSnapshot();
      });

      test('no app found', async () => {
        expect(
          gabliamFindApp(
            resolve(__dirname, './fixtures/applications/one/withconfig'),
            'lolApp'
          )
        ).rejects.toMatchSnapshot();
      });
    });

    describe('2 applications', () => {
      test('app', async () => {
        const apps = await gabliamFindApp(
          resolve(__dirname, './fixtures/applications/two'),
          'MyApp'
        );
        expect(apps).toMatchSnapshot();
        expect(apps.name).toMatchSnapshot();
        expect(gabliamBuilder(apps)).resolves.toMatchSnapshot();
      });
    });
  });
});

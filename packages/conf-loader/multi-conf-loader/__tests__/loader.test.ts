import { resolve } from 'path';
import multiConfLoader from '../src';

describe('must load the good project without profile', () => {
  test('load test', async () => {
    expect(
      await multiConfLoader({
        folder: resolve(__dirname, './fixture'),
        projectName: 'test',
      })
    ).toMatchSnapshot();
  });

  test('load test2', async () => {
    expect(
      await multiConfLoader({
        folder: resolve(__dirname, './fixture'),
        projectName: 'test2',
      })
    ).toMatchSnapshot();
  });
});

describe('must load the good project with profile', () => {
  test('load test', async () => {
    expect(
      await multiConfLoader(
        {
          folder: resolve(__dirname, './fixture'),
          projectName: 'test',
        },
        'dev'
      )
    ).toMatchSnapshot();
  });

  test('load test2', async () => {
    expect(
      await multiConfLoader(
        {
          folder: resolve(__dirname, './fixture'),
          projectName: 'test2',
        },
        'dev'
      )
    ).toMatchSnapshot();
  });
});

describe('error', () => {
  test('bad path', async () => {
    expect(
      await multiConfLoader(
        {
          folder: resolve(__dirname, './fixture/empty'),
          projectName: 'test',
        },
        'dev'
      )
    ).toMatchSnapshot();
  });

  test('with bad constant', async () => {
    await expect(
      multiConfLoader(
        {
          folder: resolve(__dirname, './fixture/badconstant'),
          projectName: 'test',
        },
        'dev'
      )
    ).rejects.toMatchSnapshot();
  });

  test('with bad application', async () => {
    await expect(
      multiConfLoader(
        {
          folder: resolve(__dirname, './fixture/badapplication'),
          projectName: 'test',
        },
        'dev'
      )
    ).rejects.toMatchSnapshot();
  });
});

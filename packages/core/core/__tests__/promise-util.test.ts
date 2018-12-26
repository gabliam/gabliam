import { toPromise } from '@gabliam/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

const wait = () => new Promise(r => setTimeout(r, 10));

test('with function return value', async () => {
  const fn = () => 'ok';
  await expect(toPromise(fn())).resolves.toMatchSnapshot();
});

test('with function return promise', async () => {
  const fn = async () => {
    await wait();
    return 'ok';
  };

  await expect(toPromise(fn())).resolves.toMatchSnapshot();
});

test('with generator function', async () => {
  function* fn() {
    yield wait();
    return 'ok';
  }

  await expect(toPromise(fn())).resolves.toMatchSnapshot();
});

test('with observable function', async () => {
  const fn = () => of('ok').pipe(delay(10));

  await expect(toPromise(fn())).resolves.toMatchSnapshot();
});

import { toPromise } from './promise';

/**
 * Call an instance and wrap with promise
 */
export async function callInstance(instance: any, key: string | symbol) {
  return toPromise(instance[key]());
}

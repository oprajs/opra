import { isConstructor } from '@jsopen/objects';
import promisify from 'putil-promisify';
import type { ThunkAsync } from 'ts-gems';

export async function resolveThunk(
  thunk: ThunkAsync<any> | Promise<any>,
): Promise<any> {
  thunk = promisify.isPromise(thunk) ? await thunk : thunk;
  if (typeof thunk === 'function') {
    if (isConstructor(thunk)) return thunk;
    return await thunk();
  }
  return thunk;
}

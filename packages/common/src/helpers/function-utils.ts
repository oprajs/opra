import promisify from 'putil-promisify';
import { Type } from 'ts-gems';
import { ThunkAsync } from '../types.js';
import { isConstructor } from './type-guards.js';

export async function resolveThunk(thunk: ThunkAsync<any>): Promise<any> {
  thunk = promisify.isPromise(thunk) ? await thunk : thunk;
  if (typeof thunk === 'function') {
    if (isConstructor(thunk))
      return thunk;
    return resolveClass(thunk())
  }
  return thunk;
}

export async function resolveClass(thunk: ThunkAsync<Type>): Promise<Type> {
  thunk = promisify.isPromise(thunk) ? await thunk : thunk;
  if (typeof thunk !== 'function')
    throw new Error(`No Class type resolved`)
  if (isConstructor(thunk))
    return thunk;
  return resolveClass(thunk())
}

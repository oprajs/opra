import { Type } from 'ts-gems';
import { TypeThunk, TypeThunkAsync } from '../types';

export function isConstructor(obj: any): obj is Type {
  return typeof obj === 'function' &&
      !!(obj.prototype && obj.prototype.constructor)
}

export function resolveClass<T>(typeOrFunc: TypeThunk<T>): Type<T> {
  if (typeof typeOrFunc === 'function' && !isConstructor(typeOrFunc)) {
    typeOrFunc = typeOrFunc();
    if (isConstructor(typeOrFunc))
      return typeOrFunc;
    throw new TypeError(`Function must return a constructor`);
  }
  if (isConstructor(typeOrFunc))
    return typeOrFunc;
  throw new TypeError(`${typeOrFunc} is not a constructor`);
}

export async function resolveClassAsync<T>(typeOrFunc: TypeThunkAsync<T>): Promise<Type<T>> {
  if (typeof typeOrFunc === 'function' && !isConstructor(typeOrFunc)) {
    typeOrFunc = await typeOrFunc();
    if (isConstructor(typeOrFunc))
      return typeOrFunc;
    throw new TypeError(`Function must return a constructor`);
  }
  if (isConstructor(typeOrFunc))
    return typeOrFunc;
  throw new TypeError(`${typeOrFunc} is not a constructor`);
}


import { Type } from 'ts-gems';

export function isConstructor(obj: any): obj is Type {
  return typeof obj === 'function' &&
      !!(obj.prototype && obj.prototype.constructor)
}

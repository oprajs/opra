import {Type} from '@nestjs/common';
import {isFunction, isString} from '@nestjs/common/utils/shared.utils';

export function isConstructor(obj: any): obj is Type {
  return typeof obj === 'function' &&
    !!(obj.prototype && obj.prototype.constructor)
}

export function getClassOrUndefined(typeOrFunc: Function | Type): Type | undefined {
  return isConstructor(typeOrFunc)
    ? typeOrFunc
    : isFunction(typeOrFunc)
      ? (typeOrFunc as Function)()
      : undefined;
}

export function getClassName(nameOrType: string | Function | Type): string | undefined {
  if (isString(nameOrType)) {
    return nameOrType;
  }
  const classOrUndefined = getClassOrUndefined(nameOrType);
  return classOrUndefined && classOrUndefined.name;
}

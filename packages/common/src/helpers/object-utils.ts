import { isPlainObject, merge } from '@jsopen/objects';
import { DATATYPE_METADATA } from '../document/constants.js';

export function cloneObject<T extends {}>(obj: T, jsonOnly?: boolean): T {
  return merge({}, obj, {
    deep: v => isPlainObject(v) && !v[DATATYPE_METADATA],
    copyDescriptors: true,
    ignoreUndefined: true,
    filter(key, source) {
      const v = source[key];
      return !jsonOnly || (typeof v !== 'function' && (typeof v !== 'object' || isPlainObject(v) || Array.isArray(v)));
    },
  }) as T;
}

import isPlainObject from 'putil-isplainobject';
import merge from 'putil-merge';

export function cloneObject<T extends {}>(obj: T, jsonOnly?: boolean): T {
  return merge({}, obj, {
    deep: true,
    clone: true,
    filter: (source: object, key: string) => {
      const v = source[key];
      return v != null &&
          !jsonOnly || (
              typeof v !== 'function' &&
              (typeof v !== 'object' || isPlainObject(v) || Array.isArray(v))
          )
    }
  }) as T;
}

export function omitUndefined<T>(obj: T, recursive?: boolean): T {
  if (!(obj && typeof obj === 'object'))
    return obj;
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined)
      delete obj[k];
    else if (recursive && typeof obj[k] === 'object')
      omitUndefined(obj[k]);
  }
  return obj;
}

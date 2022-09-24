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
              (typeof v !== 'object' || isPlainObject(v))
          )
    }
  }) as T;
}

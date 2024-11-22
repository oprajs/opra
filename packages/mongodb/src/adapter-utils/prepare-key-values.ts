import { isPlainObject } from '@jsopen/objects';

const defaultPrimaryKey = ['_id'];

export default function prepareKeyValues(keyValue: any, primaryKey?: string[]): Record<string, any> {
  primaryKey = primaryKey || defaultPrimaryKey;
  const b = isPlainObject(keyValue);
  if (primaryKey.length > 1 && !b) {
    throw new TypeError(`Argument "keyValue" must be an object that contains all key values`);
  }
  if (primaryKey.length > 1 || b) {
    return primaryKey.reduce((o, k) => {
      o[k] = keyValue[k];
      if (o[k] == null) throw new Error(`Value of key "${k}" is required`);
      return o;
    }, {});
  }
  return { [primaryKey[0]]: keyValue };
}

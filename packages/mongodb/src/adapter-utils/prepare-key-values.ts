import isPlainObject from 'putil-isplainobject';
import { Collection } from '@opra/common';

export default function prepareKeyValues(resource: Collection, keyValue: any): Record<string, any> {
  const {primaryKey} = resource;
  const b = isPlainObject(keyValue);
  if (primaryKey.length > 1 && !b)
    new TypeError(`Argument "keyValue" must be an object that contains all key values of ${resource.name} resource`);
  if (primaryKey.length > 1 || b) {
    return primaryKey.reduce((o, k) => {
      o[k] = keyValue[k];
      if (o[k] == null)
        new Error(`Value of key "${k}" is required`);
      return o;
    }, {});
  }
  return {[primaryKey[0]]: keyValue};
}

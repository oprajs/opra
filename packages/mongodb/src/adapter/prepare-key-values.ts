import { isPlainObject } from '@jsopen/objects';

const defaultPrimaryKey = ['_id'];

/**
 * Prepares the MongoDB primary key query object from the given key values.
 *
 * @param keyValue - The value of the primary key, or an object containing multiple key values.
 * @param primaryKey - An optional array of field names that form the primary key. Defaults to ['_id'].
 * @returns A record object representing the MongoDB primary key query.
 * @throws {@link TypeError} If a composite key is required but an object is not provided.
 * @throws {@link Error} If a required key field is missing in the input object.
 */
export default function prepareKeyValues(
  keyValue: any,
  primaryKey?: string[],
): Record<string, any> {
  primaryKey = primaryKey || defaultPrimaryKey;
  const b = isPlainObject(keyValue);
  if (primaryKey.length > 1 && !b) {
    throw new TypeError(
      `Argument "keyValue" must be an object that contains all key values`,
    );
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

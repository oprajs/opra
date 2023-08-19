import mongodb from 'mongodb';
import { Collection } from '@opra/common';

export default function transformKeyValues(source: Collection, keyValues: any): mongodb.Filter<any> {
  const {primaryKey} = source;
  if (primaryKey.length > 1) {
    const query: mongodb.Filter<any> = {};
    primaryKey.forEach((k, i) => {
      query[k] = typeof keyValues === 'object' ? keyValues[k] : keyValues[i];
    });
    return query;
  }
  return {[primaryKey[0]]: keyValues};
}

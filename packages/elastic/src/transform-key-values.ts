import { Collection } from '@opra/common';

export default function transformKeyValues(resource: Collection, keyValues: any): Record<string, any> {
  const {primaryKey} = resource;
  if (primaryKey.length > 1) {
    const out: Record<string, any> = {};
    primaryKey.forEach((k, i) => {
      out[k] = typeof keyValues === 'object' ? keyValues[k] : keyValues[i];
    });
    return out;
  }
  return {[primaryKey[0]]: keyValues};
}

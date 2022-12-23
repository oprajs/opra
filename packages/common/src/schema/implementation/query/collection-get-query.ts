import type { IChildFieldQuery } from '../../interfaces/child-field-query.interface.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import type { CollectionResourceInfo } from '../resource/collection-resource-info.js';
import type { FieldGetQuery } from './field-get-query.js';

export type CollectionGetQueryOptions = {
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export class CollectionGetQuery implements IChildFieldQuery {
  readonly kind = 'CollectionGetQuery';
  readonly method = 'get'
  readonly operation = 'read';
  keyValue: any;
  pick?: string[];
  omit?: string[];
  include?: string[];
  child?: FieldGetQuery;

  constructor(readonly resource: CollectionResourceInfo,
              keyValue: any,
              options?: CollectionGetQueryOptions
  ) {
    if (resource.keyFields.length > 1) {
      if (typeof keyValue !== 'object')
        throw new Error(`You must provide an key/value object for all key fields (${resource.keyFields})`);
      resource.keyFields.reduce((o, k) => {
        o[k] = keyValue[k];
        return o;
      }, {});
    } else
      this.keyValue = resource.dataType.getFieldType(resource.keyFields[0]).parse(keyValue);
    if (options?.pick)
      this.pick = normalizeFieldArray(resource.document, resource.dataType, options.pick);
    if (options?.omit)
      this.omit = normalizeFieldArray(resource.document, resource.dataType, options.omit);
    if (options?.include)
      this.include = normalizeFieldArray(resource.document, resource.dataType, options.include);
  }

  get dataType() {
    return this.resource.dataType;
  }
}

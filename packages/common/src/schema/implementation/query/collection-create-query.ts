import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { CollectionResourceInfo } from '../resource/collection-resource-info.js';

export type CollectionCreateQueryOptions = {
  pick?: string[];
  omit?: string[];
  include?: string[];
};

export class CollectionCreateQuery {
  readonly kind = 'CollectionCreateQuery';
  readonly method = 'create'
  readonly operation = 'create';
  pick?: string[];
  omit?: string[];
  include?: string[];

  constructor(readonly resource: CollectionResourceInfo,
              public data: {},
              options?: CollectionCreateQueryOptions
  ) {
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

import type { IChildFieldQuery } from '../../interfaces/child-field-query.interface.js';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import type { SingletonResourceInfo } from '../resource/singleton-resource-info.js';
import type { FieldGetQuery } from './field-get-query.js';

export type SingletonGetQueryOptions = {
  pick?: string[];
  omit?: string[];
  include?: string[];
}

export class SingletonGetQuery implements IChildFieldQuery {
  readonly kind = 'SingletonGetQuery';
  readonly method = 'get'
  readonly operation = 'read';
  pick?: string[];
  omit?: string[];
  include?: string[];
  child?: FieldGetQuery;

  constructor(readonly resource: SingletonResourceInfo,
              options?: SingletonGetQueryOptions
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

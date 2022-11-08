import { BadRequestError } from '@opra/exception';
import { translate } from '@opra/i18n';
import { Expression, parseFilter } from '@opra/url';
import { normalizeFieldArray } from '../../utils/normalize-field-array.util.js';
import { CollectionResourceInfo } from '../resource/collection-resource-info.js';

export type CollectionSearchQueryOptions = {
  pick?: string[];
  omit?: string[];
  include?: string[];
  filter?: string | Expression;
  limit?: number;
  skip?: number;
  distinct?: boolean;
  count?: boolean;
  sort?: string[];
}

export class CollectionSearchQuery {
  readonly kind = 'SearchCollectionQuery';
  readonly method = 'search'
  readonly operation = 'read';
  pick?: string[];
  omit?: string[];
  include?: string[];
  filter?: Expression;
  limit?: number;
  skip?: number;
  distinct?: boolean;
  count?: boolean;
  sort?: string[];

  constructor(readonly resource: CollectionResourceInfo,
              options?: CollectionSearchQueryOptions
  ) {
    if (options?.pick)
      this.pick = normalizeFieldArray(resource.document, resource.dataType, options.pick);
    if (options?.omit)
      this.omit = normalizeFieldArray(resource.document, resource.dataType, options.omit);
    if (options?.include)
      this.include = normalizeFieldArray(resource.document, resource.dataType, options.include);
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
    this.limit = options?.limit;
    this.skip = options?.skip;
    this.distinct = options?.distinct;
    this.count = options?.count;
    if (options?.sort) {
      this.sort = normalizeFieldArray(resource.document, resource.dataType, options.sort);
      const search = resource.search;
      if (search && typeof search === 'object') {
        const sortFields = search.sortFields;
        if (sortFields) {
          this.sort.forEach(field => {
            if (!sortFields.find(x => x === field))
              throw new BadRequestError({
                message: translate('error:UNACCEPTED_SORT_FIELD', {field},
                    `Field '${field}' is not available for sort operation`),
              })
          })
        }
      }
    }
  }

  get dataType() {
    return this.resource.dataType;
  }
}

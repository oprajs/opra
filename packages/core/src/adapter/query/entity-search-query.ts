import {
  BadRequestError,
  Collection, Expression,
  HttpHeaderCodes,
  normalizeElementNames, parseFilter, PartialOutput,
  translate
} from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery } from './entity-query.js';

export namespace CollectionSearchQuery {
  export type Options = {
    pick?: string[];
    omit?: string[];
    include?: string[];
    filter?: string | Expression;
    limit?: number;
    skip?: number;
    distinct?: boolean;
    count?: boolean;
    sort?: string[];
  };

  export interface QueryResult<T = any> {
    items: PartialOutput<T>[];
    count?: number;
  }
}

export class CollectionSearchQuery extends EntityQuery {
  readonly subject = 'Collection';
  readonly method = 'search'
  readonly operation = 'read';
  keyValue: any;
  pick?: string[];
  omit?: string[];
  include?: string[];
  filter?: Expression;
  limit?: number;
  skip?: number;
  distinct?: boolean;
  count?: boolean;
  sort?: string[];

  // child?: ElementReadQuery;

  constructor(
      readonly resource: Collection,
      options?: CollectionSearchQuery.Options
  ) {
    super(resource);
    if (options?.pick)
      this.pick = normalizeElementNames(resource.document, resource.type, options.pick);
    if (options?.omit)
      this.omit = normalizeElementNames(resource.document, resource.type, options.omit);
    if (options?.include)
      this.include = normalizeElementNames(resource.document, resource.type, options.include);
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
    this.limit = options?.limit;
    this.skip = options?.skip;
    this.distinct = options?.distinct;
    this.count = options?.count;
    if (options?.sort) {
      this.sort = normalizeElementNames(resource.document, resource.type, options.sort);
      const searchMethod = resource.operations.search;
      if (searchMethod && typeof searchMethod === 'object') {
        const sortElements = searchMethod.sortElements;
        if (sortElements) {
          this.sort.forEach(element => {
            if (!sortElements.find(x => x === element))
              throw new BadRequestError({
                message: translate('error:UNACCEPTED_SORT_ELEMENT', {element},
                    `Element '${element}' is not available for sort operation`),
              })
          })
        }
      }
    }
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const x = await super._execute(context);
    const result: CollectionSearchQuery.QueryResult = {
      items: x ? (Array.isArray(x) ? x : x.items) : []
    };
    // todo validate
    const {resource} = this;
    context.responseHeaders.set(HttpHeaderCodes.X_Opra_DataType, resource.type.name);
    return result;
  }

}

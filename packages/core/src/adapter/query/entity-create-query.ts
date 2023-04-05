import {
  Collection,
  HttpHeaderCodes,
  InternalServerError,
  normalizeElementNames,
  Singleton
} from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery } from './entity-query.js';

/**
 * @namespace EntityCreateQuery
 */
namespace EntityCreateQuery {
  export interface Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
}

/**
 * @class EntityCreateQuery
 * @abstract
 */
abstract class EntityCreateQuery extends EntityQuery {
  readonly method = 'create'
  readonly operation = 'create';
  data: any;
  pick?: string[];
  omit?: string[];
  include?: string[];

  protected constructor(
      resource: Collection | Singleton,
      data: any,
      options?: EntityCreateQuery.Options
  ) {
    super(resource);
    this.data = data;
    if (options?.pick)
      this.pick = normalizeElementNames(resource.document, resource.type, options.pick);
    if (options?.omit)
      this.omit = normalizeElementNames(resource.document, resource.type, options.omit);
    if (options?.include)
      this.include = normalizeElementNames(resource.document, resource.type, options.include);
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    let result = await super._execute(context);
    result = Array.isArray(result) ? result[0] : result;
    if (!result)
      throw new InternalServerError();
    // todo validate
    context.status = 201;
    context.responseHeaders.set(HttpHeaderCodes.X_Opra_DataType ,this.resource.type.name);
    return result;
  }
}

/**
 * @namespace SingletonCreateQuery
 */
export namespace SingletonCreateQuery {
  export interface Options extends EntityCreateQuery.Options {
  }
}

/**
 * @class SingletonCreateQuery
 */
export class SingletonCreateQuery extends EntityCreateQuery {
  readonly subject = 'Singleton';

  constructor(
      readonly resource: Singleton,
      data: any,
      options?: SingletonCreateQuery.Options
  ) {
    super(resource, data, options);
  }
}

/**
 * @namespace CollectionCreateQuery
 */
export namespace CollectionCreateQuery {
  export interface Options extends EntityCreateQuery.Options {
  }
}

/**
 * @class CollectionCreateQuery
 */
export class CollectionCreateQuery extends EntityCreateQuery {
  readonly subject = 'Collection';

  constructor(
      readonly resource: Collection,
      data: any,
      options?: CollectionCreateQuery.Options
  ) {
    super(resource, data, options);
  }
}

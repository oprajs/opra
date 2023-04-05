import {
  Collection,
  HttpHeaderCodes,
  normalizeElementNames,
  ResourceNotFoundError, Singleton
} from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery, parseKeyValue } from './entity-query.js';

/**
 * @namespace EntityGetQuery
 */
namespace EntityGetQuery {
  export type Options = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  };
}

/**
 * @class EntityGetQuery
 * @abstract
 */
abstract class EntityGetQuery extends EntityQuery {
  readonly method = 'get'
  readonly operation = 'read';
  keyValue: any;
  pick?: string[];
  omit?: string[];
  include?: string[];

  protected constructor(
      resource: Collection | Singleton,
      options?: EntityGetQuery.Options
  ) {
    super(resource);
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
    context.responseHeaders.set(HttpHeaderCodes.X_Opra_DataType, this.resource.type.name);
    return result;
  }

}


/**
 * @namespace SingletonGetQuery
 */
export namespace SingletonGetQuery {
  export interface Options extends EntityGetQuery.Options {
  }
}

/**
 * @class SingletonGetQuery
 */
export class SingletonGetQuery extends EntityGetQuery {
  readonly subject = 'Singleton';

  constructor(readonly resource: Singleton, options?: SingletonGetQuery.Options) {
    super(resource, options);
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const result = await super._execute(context);
    if (!result)
      throw new ResourceNotFoundError(this.resource.name);
    return result;
  }
}

/**
 * @namespace CollectionGetQuery
 */
export namespace CollectionGetQuery {
  export interface Options extends EntityGetQuery.Options {
  }
}

/**
 * @class CollectionGetQuery
 */
export class CollectionGetQuery extends EntityGetQuery {
  readonly subject = 'Collection';
  keyValue: any;

  constructor(readonly resource: Collection, keyValue: any, options?: CollectionGetQuery.Options) {
    super(resource, options);
    this.keyValue = parseKeyValue(resource, keyValue);
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const result = await super._execute(context);
    if (!result)
      throw new ResourceNotFoundError(this.resource.name, this.keyValue);
    return result;
  }
}

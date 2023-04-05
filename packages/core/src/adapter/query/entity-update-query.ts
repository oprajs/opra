import {
  Collection,
  HttpHeaderCodes,
  normalizeElementNames,
  ResourceNotFoundError, Singleton
} from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery, parseKeyValue } from './entity-query.js';

/**
 * @namespace EntityUpdateQuery
 */
namespace EntityUpdateQuery {
  export type Options = {
    pick?: string[];
    omit?: string[];
    include?: string[];
  };
}

/**
 * @class EntityUpdateQuery
 * @abstract
 */
abstract class EntityUpdateQuery extends EntityQuery {
  abstract method: 'update' | 'updateMany';
  readonly operation = 'update';
  data: any;
  pick?: string[];
  omit?: string[];
  include?: string[];

  protected constructor(
      resource: Collection | Singleton,
      data: any,
      options?: EntityUpdateQuery.Options
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
    context.responseHeaders.set(HttpHeaderCodes.X_Opra_DataType, this.resource.type.name);
    return result;
  }

}

/**
 * @namespace SingletonUpdateQuery
 */
export namespace SingletonUpdateQuery {
  export interface Options extends EntityUpdateQuery.Options {
  }
}

/**
 * @class SingletonUpdateQuery
 */
export class SingletonUpdateQuery extends EntityUpdateQuery {
  readonly subject = 'Singleton';
  readonly method = 'update';

  constructor(
      readonly resource: Singleton,
      data: any,
      options?: SingletonUpdateQuery.Options
  ) {
    super(resource, data, options);
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const result = await super._execute(context);
    if (!result)
      throw new ResourceNotFoundError(this.resource.name);
    return result;
  }
}

/**
 * @namespace CollectionUpdateQuery
 */
export namespace CollectionUpdateQuery {
  export interface Options extends EntityUpdateQuery.Options {
  }
}

/**
 * @class CollectionUpdateQuery
 */
export class CollectionUpdateQuery extends EntityUpdateQuery {
  readonly subject = 'Collection';
  readonly method = 'update';
  keyValue: any;

  constructor(
      readonly resource: Collection,
      keyValue: any,
      data: any,
      options?: SingletonUpdateQuery.Options
  ) {
    super(resource, data, options);
    this.keyValue = parseKeyValue(resource, keyValue);
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const result = await super._execute(context);
    if (!result)
      throw new ResourceNotFoundError(this.resource.name, this.keyValue);
    return result;
  }
}

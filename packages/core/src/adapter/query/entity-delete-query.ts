import { Collection, Singleton } from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery, parseAffected, parseKeyValue } from './entity-query.js';

/**
 * @class EntityDeleteQuery
 * @abstract
 */
abstract class EntityDeleteQuery extends EntityQuery {
  abstract method: 'delete' | 'deleteMany';
  readonly operation = 'delete';

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const affected = await super._execute(context);
    return {
      operation: this.method,
      affected: parseAffected(affected)
    };
  }
}

/**
 * @class  SingletonDeleteQuery
 */
export class SingletonDeleteQuery extends EntityDeleteQuery {
  readonly subject = 'Singleton';
  readonly method = 'delete';

  constructor(readonly resource: Singleton) {
    super(resource);
  }
}

/**
 * @class CollectionDeleteQuery
 */
export class CollectionDeleteQuery extends EntityDeleteQuery {
  readonly subject = 'Collection';
  readonly method = 'delete';
  keyValue: any;

  constructor(readonly resource: Collection, keyValue: any) {
    super(resource);
    this.keyValue = parseKeyValue(resource, keyValue);
  }
}

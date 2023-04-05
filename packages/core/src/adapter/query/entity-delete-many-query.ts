import { Collection, Expression, parseFilter } from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery, parseAffected } from './entity-query.js';

export namespace CollectionDeleteManyQuery {
  export type Options = {
    filter?: string | Expression;
  }
}

export class CollectionDeleteManyQuery extends EntityQuery {
  readonly subject = 'Collection';
  readonly method = 'deleteMany'
  readonly operation = 'delete';
  filter?: Expression;

  constructor(
      readonly resource: Collection,
      options?: CollectionDeleteManyQuery.Options
  ) {
    super(resource);
    this.filter = typeof options?.filter === 'string' ? parseFilter(options.filter) : options?.filter;
  }

  protected override async _execute(context: QueryRequestContext): Promise<any> {
    const affected = await super._execute(context);
    return {
      operation: this.method,
      affected: parseAffected(affected)
    };
  }

}

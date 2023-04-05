import { Collection, Expression, parseFilter } from '@opra/common';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { EntityQuery, parseAffected } from './entity-query.js';

export namespace CollectionUpdateManyQuery {
  export type Options = {
    filter?: string | Expression;
  }
}

export class CollectionUpdateManyQuery extends EntityQuery {
  readonly subject = 'Collection';
  readonly method = 'updateMany'
  readonly operation = 'update';
  data: any;
  filter?: Expression;

  constructor(
      readonly resource: Collection,
      data: any,
      options?: CollectionUpdateManyQuery.Options
  ) {
    super(resource);
    this.data = data;
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

import { OpraQuery } from '../query/index.js';
import { RequestContext, RequestContextArgs } from './request-context.js';

export type QueryRequestContextArgs<T extends OpraQuery = OpraQuery> = RequestContextArgs & {
  readonly query: T;
};

export class QueryRequestContext<T extends OpraQuery = OpraQuery> extends RequestContext {
  readonly query: T;

  constructor(args: QueryRequestContextArgs<T>) {
    super(args);
    this.query = args.query;
  }

  get userContext() {
    return this.executionContext.userContext;
  }

}

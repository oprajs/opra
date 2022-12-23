import { OpraQuery } from '@opra/common';
import { RequestContext, RequestContextArgs } from './request-context.js';

export type QueryRequestContextArgs = RequestContextArgs & {
  readonly query: OpraQuery;
};

export class SingleRequestContext extends RequestContext {
  readonly query: OpraQuery;

  constructor(args: QueryRequestContextArgs) {
    super(args);
    this.query = args.query;
  }

  get userContext() {
    return this.executionContext.userContext;
  }

}

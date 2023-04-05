import { QueryRequestContext } from './query-request-context.js';
import { RequestContext, RequestContextArgs } from './request-context.js';

export type BatchContextArgs = RequestContextArgs & Pick<BatchRequestContext, 'queries'>;

export class BatchRequestContext extends RequestContext {
  readonly queries: QueryRequestContext[];

  constructor(args: BatchContextArgs) {
    super(args);
    this.queries = args.queries;
  }
}

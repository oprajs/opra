import { RequestContext, RequestContextArgs } from './request-context.js';
import { SingleRequestContext } from './single-request-context.js';

export type BatchContextArgs = RequestContextArgs & Pick<BatchRequestContext, 'queries'>;

export class BatchRequestContext extends RequestContext {
  readonly queries: SingleRequestContext[];

  constructor(args: BatchContextArgs) {
    super(args);
    this.queries = args.queries;
  }
}

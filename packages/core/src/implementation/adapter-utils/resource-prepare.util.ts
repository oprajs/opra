import { OpraResource } from '@opra/schema';
import { QueryContext } from '../query-context.js';

export async function resourcePrepare(resource: OpraResource, context: QueryContext) {
  const {query} = context;
  const fn = resource.metadata['pre_' + query.method];
  if (fn && typeof fn === 'function') {
    await fn(context);
  }
}

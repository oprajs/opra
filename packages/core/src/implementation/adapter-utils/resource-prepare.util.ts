import { BaseResource } from '@opra/schema';
import { QueryContext } from '../query-context.js';

export async function resourcePrepare(resource: BaseResource, context: QueryContext) {
  const {query} = context;
  const fn = resource.metadata['pre_' + query.queryType];
  if (fn && typeof fn === 'function') {
    await fn(context);
  }
}

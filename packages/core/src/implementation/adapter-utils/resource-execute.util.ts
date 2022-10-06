import { OpraResource, EntityResource, OpraService } from '@opra/schema';
import { QueryContext } from '../query-context.js';
import { entityResourceExecute } from './entity-resource-execute.util.js';

export async function resourceExecute(service: OpraService, resource: OpraResource, context: QueryContext) {
  if (resource instanceof EntityResource)
    return await entityResourceExecute(service, resource, context);
  throw new Error(`Executing "${resource.kind}" has not been implemented yet`);
}

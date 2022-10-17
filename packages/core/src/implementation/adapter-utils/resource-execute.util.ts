import { CollectionResource, OpraApi, OpraResource } from '@opra/schema';
import { QueryContext } from '../query-context.js';
import { collectionResourceExecute } from './entity-resource-execute.util.js';

export async function resourceExecute(service: OpraApi, resource: OpraResource, context: QueryContext) {
  if (resource instanceof CollectionResource)
    return await collectionResourceExecute(service, resource, context);
  throw new Error(`Executing "${resource.kind}" has not been implemented yet`);
}

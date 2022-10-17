import { ForbiddenError, ResourceNotFoundError } from '@opra/exception';
import { translate } from '@opra/i18n';
import {
  CollectionResource,
  ComplexType,
  DataType,
  OpraApi,
  OpraCountCollectionQuery,
  OpraUpdateInstanceQuery
} from '@opra/schema';
import { HttpHeaders } from '../../enums/index.js';
import { QueryContext } from '../query-context.js';

export async function collectionResourceExecute(service: OpraApi, resource: CollectionResource, context: QueryContext) {
  const {query} = context;
  if (query.kind === 'SearchCollectionQuery') {
    const promises: Promise<any>[] = [];
    let search: any;
    promises.push(
        executeFn(service, resource, context)
            .then(v => search = v)
    );
    if (query.count && resource.metadata.methods.count) {
      const ctx = {
        query: new OpraCountCollectionQuery(query.resource, {filter: query.filter}),
        resultPath: ''
      } as QueryContext;
      Object.setPrototypeOf(ctx, context);
      promises.push(executeFn(service, resource, ctx));
    }
    await Promise.all(promises);
    context.response = search;
    return;
  }
  context.response = await executeFn(service, resource, context);
}

async function executeFn(
    service: OpraApi,
    resource: CollectionResource,
    context: QueryContext,
): Promise<any> {
  const method = context.query.method;
  const resolverInfo = resource.metadata.methods?.[method];
  if (!(resolverInfo && resolverInfo.handler))
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {method},
          `The resource endpoint does not accept '{{method}}' operations`),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });
  let result = await resolverInfo.handler(context);
  switch (method) {
    case 'search':
      const items = Array.isArray(result) ? result : (context.response ? [result] : []);
      context.responseHeaders.set(HttpHeaders.X_Opra_Schema, resource.dataType.name);
      return items;
    case 'get':
    case 'update':
      if (!result) {
        const query = context.query as OpraUpdateInstanceQuery;
        throw new ResourceNotFoundError(resource.name, query.keyValue);
      }
      break;
    case 'count':
      context.responseHeaders.set(HttpHeaders.X_Opra_Count, result);
      return;
    case 'delete':
    case 'deleteMany':
    case 'updateMany':
      let affected;
      if (typeof result === 'number')
        affected = result;
      if (typeof result === 'boolean')
        affected = result ? 1 : 0;
      if (typeof result === 'object')
        affected = result.affectedRows || result.affected;
      return {
        operation: context.query.method,
        affected
      };
  }

  if (!result)
    return;

  result = Array.isArray(result) ? result[0] : result;

  let dataType: DataType | undefined = resource.dataType;
  if (context.resultPath) {
    const pathArray = context.resultPath.split('.');
    for (const field of pathArray) {
      const prop = dataType instanceof ComplexType ? dataType.fields.get(field) : undefined;
      dataType = prop && prop.type ? service.types.get(prop.type) : undefined;
      result = result && typeof result === 'object' && result[field];
    }
  }

  if (method === 'create')
    context.status = 201;

  context.responseHeaders.set(HttpHeaders.X_Opra_Schema, resource.dataType.name)
  return result;
}

import { ForbiddenError, ResourceNotFoundError } from '@opra/exception';
import { translate } from '@opra/i18n';
import {
  ComplexType,
  DataType,
  EntityResource,
  OpraCountCollectionQuery,
  OpraService,
  OpraUpdateInstanceQuery
} from '@opra/schema';
import { HttpHeaders } from '../../enums/index.js';
import { QueryContext, QueryResponse } from '../query-context.js';

export async function entityResourceExecute(service: OpraService, resource: EntityResource, context: QueryContext) {
  const {query} = context;
  if (query.kind === 'SearchCollectionQuery') {
    const promises: Promise<any>[] = [];
    let search: any;
    let count: any;
    promises.push(
        executeFn(service, resource, context)
            .then(v => search = v)
    );
    if (query.count && resource.metadata.methods.count) {
      const ctx = {
        query: new OpraCountCollectionQuery(query.resource, {filter: query.filter}),
        response: new QueryResponse()
      } as QueryContext;
      Object.setPrototypeOf(ctx, context);
      promises.push(executeFn(service, resource, ctx)
          .then(v => count = v));
    }
    await Promise.all(promises);
    context.response.value = {
      ...count,
      ...search,
    }
    return;
  }
  context.response.value = await executeFn(service, resource, context);
}

async function executeFn(
    service: OpraService,
    resource: EntityResource,
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
      context.response.headers.set(HttpHeaders.X_Opra_Schema, '/$schema/types/' + resource.dataType.name);
      return {
        items: Array.isArray(result) ? result : (context.response.value ? [result] : [])
      };
    case 'get':
    case 'update':
      if (!result) {
        const query = context.query as OpraUpdateInstanceQuery;
        throw new ResourceNotFoundError(resource.name, query.keyValue);
      }
      break;
    case 'count':
      return {count: result || 0};
    case 'delete':
    case 'deleteMany':
    case 'updateMany':
      let affectedRecords;
      if (typeof result === 'number')
        affectedRecords = result;
      if (typeof result === 'boolean')
        affectedRecords = result ? 1 : 0;
      if (typeof result === 'object')
        affectedRecords = result.affectedRows || result.affectedRecords;
      return {affectedRecords};
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
    context.response.status = 201;

  if (dataType)
    context.response.headers.set(HttpHeaders.X_Opra_Schema, '/$schema/types/' + dataType.name);

  return result;
}

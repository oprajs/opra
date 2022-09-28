import { translate } from '@opra/i18n';
import { ComplexType, DataType, EntityResource, OpraService } from '@opra/schema';
import { HttpHeaders } from '../../enums/index.js';
import { ForbiddenError, ResourceNotFoundError } from '../../exception/index.js';
import { OpraGetEntityQuery, OpraQuery } from '../../interfaces/query.interface.js';
import { QueryContext } from '../query-context.js';

export async function entityResourceExecute(service: OpraService, resource: EntityResource, context: QueryContext) {
  const {query} = context;
  if (OpraQuery.isSearchQuery(query)) {
    const promises: Promise<any>[] = [];
    let search: any;
    let count: any;
    promises.push(
        executeFn(service, resource, context, query.queryType)
            .then(v => search = v)
    );
    if (query.count) {
      promises.push(executeFn(service, resource, context, 'count')
          .then(v => count = v));
    }
    await Promise.all(promises);
    context.response.value = {
      ...search,
      ...count
    }
    return;
  }
  context.response.value = await executeFn(service, resource, context, query.queryType);
}

async function executeFn(service: OpraService, resource: EntityResource, context: QueryContext, queryType: string): Promise<any> {
  const resolverInfo = resource.metadata.methods?.[queryType];
  if (!resolverInfo.handler)
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {queryType}),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });
  let result = await resolverInfo.handler(context);
  switch (queryType) {
    case 'search':
      context.response.headers.set(HttpHeaders.X_Opra_Schema, '/$schema/types/' + resource.dataType.name);
      return {
        items: Array.isArray(result) ? result : (context.response.value ? [result] : [])
      };
    case 'get':
    case 'update':
      if (!result) {
        const query = context.query as OpraGetEntityQuery;
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

  if (queryType === 'create')
    context.response.status = 201;

  if (dataType)
    context.response.headers.set(HttpHeaders.X_Opra_Schema, '/$schema/types/' + dataType.name);

  return result;
}

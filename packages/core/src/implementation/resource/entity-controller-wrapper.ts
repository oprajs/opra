import { translate } from '@opra/i18n';
import { OpraSchema } from '@opra/schema';
import {
  ForbiddenError,
  ResourceNotFoundError
} from '../../exception/index.js';
import { OpraGetEntityQuery, OpraQuery } from '../../interfaces/query.interface.js';
import { ComplexType } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EntityType } from '../data-type/entity-type.js';
import { OpraService } from '../opra-service.js';
import { QueryContext } from '../query-context.js';
import { BaseControllerWrapper } from './base-controller-wrapper.js';

export class EntityControllerWrapper extends BaseControllerWrapper {
  declare protected readonly _metadata: OpraSchema.EntityResource;
  readonly dataType: EntityType;

  constructor(
      service: OpraService,
      dataType: EntityType,
      metadata: OpraSchema.EntityResource
  ) {
    // noinspection SuspiciousTypeOfGuard
    if (!(dataType instanceof EntityType))
      throw new TypeError(`You should provide an EntityType for EntityController`);
    super(service, metadata);
    this.dataType = dataType;
  }

  async execute(ctx: QueryContext): Promise<void> {
    const {query} = ctx;
    if (OpraQuery.isSearchQuery(query)) {
      const promises: Promise<any>[] = [];
      let search: any;
      let count: any;
      promises.push(
          this._executeFn(ctx, query.queryType)
              .then(v => search = v)
      );
      if (query.count) {
        promises.push(this._executeFn(ctx, 'count')
            .then(v => count = v));
      }
      await Promise.all(promises);
      ctx.response.value = {
        ...search,
        ...count
      }
      return;
    }
    ctx.response.value = await this._executeFn(ctx, query.queryType);
  }

  async _executeFn(ctx: QueryContext, queryType: string): Promise<any> {
    const resolverInfo = this._metadata.methods?.[queryType];
    if (!resolverInfo.handler)
      throw new ForbiddenError({
        message: translate('RESOLVER_FORBIDDEN', {queryType}),
        severity: 'error',
        code: 'RESOLVER_FORBIDDEN'
      });
    let result = await resolverInfo.handler(ctx);
    switch (queryType) {
      case 'search':
        return {
          '@opra:schema': '/$metadata/types/' + this.dataType.name,
          items: Array.isArray(result) ? result : (ctx.response.value ? [result] : [])
        };
      case 'get':
      case 'update':
        if (!result) {
          const query = ctx.query as OpraGetEntityQuery;
          throw new ResourceNotFoundError(this.name, query.keyValue);
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

    let dataType: DataType | undefined = this.dataType;
    if (ctx.resultPath) {
      const pathArray = ctx.resultPath.split('.');
      for (const property of pathArray) {
        const prop = dataType instanceof ComplexType ? dataType.properties?.[property] : undefined;
        dataType = prop && prop.type ? this.service.types[prop.type || 'string'] : undefined;
        result = result && typeof result === 'object' && result[property];
      }
    }

    if (queryType === 'create')
      ctx.response.status = 201;

    return {
      '@opra:schema': dataType ? '/$metadata/types/' + dataType.name : '__unknown__',
      ...result
    };
  }

  getMetadata(jsonOnly?: boolean): OpraSchema.EntityResource {
    const out = super.getMetadata(jsonOnly) as OpraSchema.EntityResource;
    if (out.methods) {
      for (const k of Object.keys(out.methods)) {
        if (typeof out.methods[k] === 'object' && !Object.keys(out.methods[k]).length)
          out.methods[k] = true;
      }
    }
    return out;
  }


}

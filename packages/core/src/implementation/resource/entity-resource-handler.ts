import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { translate } from '@opra/i18n';
import { OpraSchema } from '@opra/schema';
import {
  ForbiddenError,
  NotAcceptableError,
  NotFoundError,
  ResourceNotFoundError,
  UnprocessableEntityError
} from '../../exception/index.js';
import { OpraGetEntityQuery, OpraQuery } from '../../interfaces/query.interface.js';
import { ComplexType } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EntityType } from '../data-type/entity-type.js';
import { OpraService } from '../opra-service.js';
import { QueryContext } from '../query-context.js';
import { ResourceHandler } from './resource-handler.js';

export type EntityResourceControllerArgs = StrictOmit<OpraSchema.EntityResource, 'kind'> & {
  service: OpraService;
  dataType: EntityType;
}

export class EntityResourceHandler extends ResourceHandler {
  declare protected readonly _args: OpraSchema.EntityResource;
  readonly service: OpraService;
  readonly dataType: EntityType;

  constructor(args: EntityResourceControllerArgs) {
    super({
      kind: 'EntityResource',
      ..._.omit(args, ['dataType', 'service'])
    });
    this.dataType = args.dataType;
    this.service = args.service;
    // noinspection SuspiciousTypeOfGuard
    if (!(args.dataType instanceof EntityType))
      throw new TypeError(`You should provide an EntityType for EntityResourceController`);
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
    const resolverInfo = this._args.resolvers?.[queryType];
    if (resolverInfo.forbidden || !resolverInfo.handler)
      throw new ForbiddenError({
        message: translate('RESOLVER_FORBIDDEN', {queryType}),
        severity: 'error',
        code: 'RESOLVER_FORBIDDEN'
      });
    let result = await resolverInfo.handler(ctx);
    switch (queryType) {
      case 'search':
        return {
          '@opra:metadata': '/$metadata/types/' + this.dataType.name,
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
      '@opra:metadata': dataType ? '/$metadata/types/' + dataType.name : '__unknown__',
      ...result
    };
  }

}

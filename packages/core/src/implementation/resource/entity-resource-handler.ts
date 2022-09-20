import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { OpraQuery } from '../../interfaces/execution-query.interface.js';
import { EntityType } from '../data-type/entity-type.js';
import { OpraService } from '../opra-service.js';
import { QueryContext } from '../query-context.js';
import { ResourceHandler } from './resource-handler.js';
import isSearchQuery = OpraQuery.isSearchQuery;
import { UnprocessableEntityError } from '../../exception/index.js';

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
    if (isSearchQuery(query)) {
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

  async _executeFn(ctx: QueryContext, fnName: string): Promise<any> {
    const fn = this._args[fnName];
    let result = typeof fn === 'function' ? (await fn(ctx)) : undefined;
    switch (fnName) {
      case 'search':
        return {items: Array.isArray(result) ? result : (ctx.response.value ? [result] : [])};
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

    result = Array.isArray(result) ? result[0] : result;

    if (!result)
      throw new UnprocessableEntityError();

    if (ctx.resultPath) {
      const pathArray = ctx.resultPath.split('.');
      for (const property of pathArray) {
        result = result && typeof result === 'object' && result[property];
      }
    }

    if (fnName === 'create')
      ctx.response.status = 201;

    return result;
  }

}

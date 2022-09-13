import _ from 'lodash';
import { Maybe, StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { EntityType } from '../data-type/entity-type.js';
import { ExecutionContext } from '../execution-context.js';
import { OpraService } from '../opra-service.js';
import { ResourceInfo } from './resource-info.js';

export type EntityResourceControllerArgs = StrictOmit<OpraSchema.EntityResource, 'kind'> & {
  service: OpraService;
  dataType: EntityType;
}

export class EntityResourceInfo extends ResourceInfo {
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

  get search(): Maybe<Function> {
    return this._args.search;
  }

  get create(): Maybe<Function> {
    return this._args.create;
  }

  get read(): Maybe<Function> {
    return this._args.read;
  }

  get update(): Maybe<Function> {
    return this._args.update;
  }

  get updateAll(): Maybe<Function> {
    return this._args.updateMany;
  }

  get delete(): Maybe<Function> {
    return this._args.delete;
  }

  get deleteMany(): Maybe<Function> {
    return this._args.deleteMany;
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const {query} = ctx.request;
    const fn = this._args[query.queryType];
    const result = typeof fn === 'function' ? (await fn(ctx)) : undefined;
    if (query.queryType === 'search') {
      ctx.response.value = Array.isArray(result)
          ? result
          : (ctx.response.value ? [result] : []);
    } else if (query.queryType === 'delete' ||
        query.queryType === 'deleteMany' ||
        query.queryType === 'updateMany'
    ) {
      let affected = result;
      if (affected && typeof affected === 'object')
        affected = result.affected || result.affectedRows;
      affected = typeof affected === 'number' ? affected :
          (affected === false ? 0 : (affected ? 1 : 0));
      ctx.response.value = {
        affected
      }
    } else
      ctx.response.value = Array.isArray(result) ? result[0] : result;
  }

}

import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { IEntityResource } from '../../interfaces/entity-resource.interface.js';
import { EntityType } from '../data-type/entity-type.js';
import { ExecutionContext } from '../execution-context.js';
import { OpraService } from '../opra-service.js';
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

  async execute(ctx: ExecutionContext): Promise<void> {
    const {query} = ctx.request;
    let fn = this._args[query.queryType];
    if (!fn && this._args.instance) {
      const getService = (this._args.instance as IEntityResource).getService;
      if (typeof getService === 'function') {
        const service = await getService.call(this._args.instance, ctx);
        if (service) {
          fn = service.processRequest.bind(service);
        }
      }
    }

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

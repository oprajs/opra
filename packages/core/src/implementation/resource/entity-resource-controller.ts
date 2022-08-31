import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { ComplexType } from '../data-type/complex-type.js';
import { ExecutionContext } from '../execution-context.js';
import { ResourceController } from './resource-controller.js';

export type EntityResourceControllerArgs = StrictOmit<OpraSchema.EntityResource, 'kind'> & {
  dataType: ComplexType;
}

export class EntityResourceController extends ResourceController {
  declare protected readonly _args: OpraSchema.EntityResource;
  readonly dataType: ComplexType;

  constructor(args: EntityResourceControllerArgs) {
    super({
      kind: 'EntityResource',
      ..._.omit(args, 'dataType')
    });
    this.dataType = args.dataType;
  }

  get primaryKey(): string | string[] {
    return this._args.primaryKey;
  }

  get search(): OpraSchema.ResourceSearchOperation | undefined {
    return this._args.search;
  }

  get create(): OpraSchema.ResourceCreateOperation | undefined {
    return this._args.create;
  }

  get update(): OpraSchema.ResourceUpdateOperation | undefined {
    return this._args.update;
  }

  get patch(): OpraSchema.ResourcePatchOperation | undefined {
    return this._args.patch;
  }

  get delete(): OpraSchema.ResourceDeleteOperation | undefined {
    return this._args.delete;
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const {query} = ctx.request;
    const fn = this._args[query.queryType]?.handler;
    const data = typeof fn === 'function' ? (await fn(ctx)) : undefined;
    if (data != null) {
      ctx.response.value = query.queryType === 'search'
          ? (Array.isArray(data) ? data : [data])
          : (Array.isArray(data) ? data[0] : data);
    } else if (query.queryType === 'search')
      ctx.response.value = [];
  }

}

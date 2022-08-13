import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { ExecutionContext } from '../../interfaces/execution-context.interface';
import { ComplexType } from '../data-type/complex-type';
import { Resource } from './resource';

export type EntityResourceArgs = StrictOmit<OpraSchema.EntityResource, 'kind'> & {
  dataType: ComplexType;
}

export class EntityResource extends Resource {
  declare protected readonly _args: OpraSchema.EntityResource;
  readonly dataType: ComplexType;

  constructor(args: EntityResourceArgs) {
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
    const fn = this._args[query.operationType]?.handler;
    const data = typeof fn === 'function' ? (await fn(ctx)) : undefined;
    if (data != null) {
      ctx.response.value = query.operationType === 'search'
          ? (Array.isArray(data) ? data : [data])
          : (Array.isArray(data) ? data[0] : data);
    } else if (query.operationType === 'search')
      ctx.response.value = [];
  }

}

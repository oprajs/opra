import { OpraSchema } from '@opra/schema';
import { ExecutionContext } from '../implementation/execution-context.js';

export interface IEntityResource<T = any> {

  search?(...args: any[]): Promise<OpraSchema.EntitySearchResult<T>>;

  get?(...args: any[]): Promise<OpraSchema.EntityGetResult<T>>;

  create?(...args: any[]): Promise<OpraSchema.EntityCreateResult<T>>;

  update?(...args: any[]): Promise<OpraSchema.EntityUpdateResult<T>>;

  updateMany?(...args: any[]): Promise<OpraSchema.EntityUpdateManyResult>;

  delete?(...args: any[]): Promise<OpraSchema.EntityDeleteResult>;

  deleteMany?(...args: any[]): Promise<OpraSchema.EntityDeleteManyResult>;

  getService?(ctx: ExecutionContext): IEntityService | Promise<IEntityService>;

}

export interface IEntityService {

  processRequest(ctx: ExecutionContext): any;

}

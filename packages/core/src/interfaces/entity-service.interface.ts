import { Maybe } from 'ts-gems';
import { IResource, OpraResource } from '@opra/schema';
import { EntityOutput } from '@sqb/connect';
import { QueryContext } from '../implementation/query-context.js';

export interface IEntityService {
  processRequest(ctx: QueryContext): any;
}

export abstract class EntityResourceController<T, TOutput = EntityOutput<T>> implements IResource {

  async search(ctx: QueryContext): Promise<TOutput[]> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async get(ctx: QueryContext): Promise<Maybe<TOutput>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async count(ctx: QueryContext): Promise<number> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async create(ctx: QueryContext): Promise<TOutput> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async update(ctx: QueryContext): Promise<Maybe<TOutput>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async updateMany(ctx: QueryContext): Promise<Maybe<number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async delete(ctx: QueryContext): Promise<Maybe<boolean | number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async deleteMany(ctx: QueryContext): Promise<Maybe<number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  abstract init(service: OpraResource): void | Promise<void>;

  abstract getService(ctx: QueryContext): IEntityService | Promise<IEntityService>;

}

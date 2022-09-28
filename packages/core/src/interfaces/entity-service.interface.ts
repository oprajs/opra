import { Maybe } from 'ts-gems';
import { EntityOutput } from '@sqb/connect';
import { QueryContext } from '../implementation/query-context.js';

export interface IEntityService {
  processRequest(ctx: QueryContext): any;
}

export abstract class EntityResourceController<T> {

  async search(ctx: QueryContext): Promise<Maybe<EntityOutput<T>>[]> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async get(ctx: QueryContext): Promise<Maybe<EntityOutput<T>>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async count(ctx: QueryContext): Promise<Maybe<number>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async create(ctx: QueryContext): Promise<Maybe<EntityOutput<T>>> {
    return (await this.getService(ctx)).processRequest(ctx);
  }

  async update(ctx: QueryContext): Promise<Maybe<EntityOutput<T>>> {
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

  abstract getService(ctx: QueryContext): IEntityService | Promise<IEntityService>;
}
